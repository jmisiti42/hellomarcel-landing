const config				= require('./config/config.json');
const express				= require('express');
const bodyParser			= require('body-parser');
const http					= require('http');
const fs					= require('fs');
const mailchimpInstance		= config.mailchimp.instance;
const listUniqueId			= config.mailchimp.luid;
const mailchimpApiKey		= config.mailchimp.key;
const Mailchimp 			= require('mailchimp-api-v3');
const app					= express();
const mongoose				= require('mongoose');
const nodemailer			= require('nodemailer');
const mailchimp 			= new Mailchimp(mailchimpApiKey);
const ipAddress 			= new Array();
const ipAddressBitly 		= new Array();
const urlTested 			= new Array();
const ipList				= new Array();
require("./models/savedUrl.js");
require("./models/url.js");
const SavedUrl = mongoose.model('SavedUrl');
const Url = mongoose.model('Url');
const db = mongoose.connection;
var isInitialized = false;

console.log(`Connecting to Mongoose default database ${config.db.uri}`);
mongoose.connect(config.db.uri);

// CONNECTION EVENTS
// If the connection throws an error
db.on('error', err => {
    console.log('Mongoose default connection error:', err);
    db.close();
});

// When successfully opened
db.once('open', () => {
    console.log(`Mongoose default connection open to ${config.db.uri}`);
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('helmet')());

app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.enable('trust proxy');

app.get('/label', (req, res) => {
	res.render('label');
});

app.get('/popup', (req, res) => {
	var msg = "Venez discuter !"
	if (req.query.msg)
		msg = req.query.msg;
	res.render('index', { msg });
});

app.get('/cgu', (req, res) => {
	res.render('cgu');
});

app.get('/guide', (req, res) => {
	var stream = fs.createReadStream('./public/guide_label.pdf');
	var filename = "guide_label.pdf"; 
  
	filename = encodeURIComponent(filename);
  
	res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
	res.setHeader('Content-type', 'application/pdf');
  
	stream.pipe(res);
});

app.get('/redirect/:url', (req, res) => {
	const reff = req.headers.referer ? extractRootDomain(req.headers.referer) : null;
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ipList.indexOf(ip) > 0)
		return res.redirect(`http://m.me/hellohellomarcel?ref=GoToStep%7C${req.params.url}`);
	else {
		return res.render('redirect', {url: req.params.url});
	}
});

app.get('/:name', (req, res) => {
	const reff = req.headers.referer ? extractRootDomain(req.headers.referer) : null;
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	Url.findOne({ name: req.params.name }).exec((error, url) => {
		if (error) res.send(error);
		else if (url) {
			if (!ipAddressBitly[url.name]) { ipAddressBitly[url.name] = new Array(); }
			if (ipAddressBitly[url.name][ip])
				return res.redirect(url.url);
			let surl = new SavedUrl({ from: reff ? reff : "Autre", name: url.name });
			surl.save((error, savedurl) => {
				if (error) { res.send(error); }
				else {
					ipAddressBitly[url.name][ip] = setTimeout(() => { ipAddressBitly[url.name][ip] = null; }, 120 * 1000 * 60);
					res.redirect(url.url);
				}
			});
		} else {
			res.send('Url invalide.');
		}
	});
});

app.get('/', (req, res) => {
	var msg = "Venez discuter !"
	if (req.query.msg)
		msg = req.query.msg;
	res.render('index', { msg });
});

app.post('/mailer', (req, res) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ipAddress[ip])
		res.json({ error: "Veuillez attendre avant d'envoyer un nouveau message." });
	else {
		ipAddress[ip] = setTimeout(() => { ipAddress[ip] = null; }, 120 * 1000 * 60);
		const mailOptions = {
		  from: req.body.email,
		  to: 'contact@hellomarcel.fr',
		  subject: 'Email venant de ' + req.body.email,
		  text: req.body.message
		};
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				res.json({ error: 'Une erreur est survenue lors de l\'envoi de votre mail. Veuillez essayer à nouveau dans quelques minutes.' });
			} else {
				res.json({ status: 'OK' });
			}
		});
	}
});

app.post('/addToList', (req, res) => {
	if (!req.body || !req.body.mail || !validateEmail(req.body.mail))
		return res.json({ status: 'ERROR', msg: 'Veuillez renseigner une addresse email valide.' });
	if (!req.body.firstname)
		return res.json({ status: 'ERROR', msg: 'Veuillez renseigner votre prénom.' });
	if (!req.body.cp)
		return res.json({ status: 'ERROR', msg: 'Veuillez renseigner votre code postal.' });
	const email = req.body.mail;
	const firstname = req.body.firstname;
	const cp = req.body.cp;
	const part = req.body.part ? req.body.part : 'Inconnu.';
	mailchimp.post('/lists/' + listUniqueId + '/members', {
			email_address : email,
			merge_fields: {
				"PART": "popup",
				"FNAME": firstname,
		        "CP": cp
		    },
			status : 'subscribed'
		}).then(function(results) {
			res.json({ status: 'OK' });
		}).catch(function (err) {
			console.log(err);
			if (err.title == "Member Exists")
				res.json({ status: 'ERROR', msg: "Vous êtes déjà inscrit !"});
			else if (err.title == "Invalid Resource")
				res.json({ status: 'ERROR', msg: "Veuillez attendre avant de vous inscrire à une nouvelle newsletter."});
			else {
				res.json({ status: 'ERROR', msg: err.detail });
			}
		});
});

http.createServer(app).listen(5001, () => console.log(`listening on port 5001`));


//Utilities
const validateEmail			= (email) => {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass
  }
});

const extractHostname = (url) => {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

const extractRootDomain = (url) => {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
};
