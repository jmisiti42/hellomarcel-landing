const express				= require('express');
const bodyParser			= require('body-parser');
const mailchimpInstance		= 'us16';
const listUniqueId			= 'f1b321ee6e';
const mailchimpApiKey		= 'fc9db4d21bab5a8d956069a08d730255-us16';
const Mailchimp 			= require('mailchimp-api-v3')
const mailchimp 			= new Mailchimp(mailchimpApiKey);
const validateEmail			= (email) => {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
const app					= express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	var msg = "Venez discuter !"
	if (req.query.msg)
		msg = req.query.msg;
	res.render('index', { msg });
});

app.get('/var/www/html', (req, res) => {
	var msg = "Venez discuter !"
	if (req.query.msg)
		msg = req.query.msg;
	res.render('index', { msg });
});

app.post('/signup', function (req, res) {
	if (!req.body || !req.body.email || !validateEmail(req.body.email))
		res.json({ status: 'ERROR', msg: 'Veuillez renseigner une addresse email valide.' });
	const email = req.body.email;
	const part = req.body.part ? req.body.part : 'Inconnu.';
	mailchimp.post('/lists/' + listUniqueId + '/members', {
			email_address : email,
			merge_fields: {
		        "PART": part
		    },
			status : 'subscribed'
		}).then(function(results) {
			res.json({ status: 'OK' });
		}).catch(function (err) {
			if (err.title == "Member Exists")
				res.json({ status: 'ERROR', msg: "Vous êtes déjà inscrit !"});
			else if (err.title == "Invalid Resource")
				res.json({ status: 'ERROR', msg: "Veuillez attendre avant de vous inscrire à une nouvelle newsletter."});
			else {
				res.json({ status: 'ERROR', msg: err.detail });
			}
		});
});

app.listen(3000, () => console.log('Server running on port 3000'));
