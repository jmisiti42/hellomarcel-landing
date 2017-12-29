const express				= require('express');
const bodyParser			= require('body-parser');
const request				= require('request');
const mailchimpInstance		= 'us6';
const listUniqueId			= 'b6a82d89f0';
const mailchimpApiKey		= '637274b5ab272affbf7df7d3723ea2a1-us6';
const app					= express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/signup', function (req, res) {
    request.post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
		.set('Content-Type', 'application/json;charset=utf-8')
		.set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
		.send({
			'email_address': req.body.email,
			'status': 'subscribed',
			'merge_fields': {
				'FROM': req.body.part
			}
		}).end(function(err, response) {
			if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
				res.send('Signed Up!');
			} else {
				res.send('Sign Up Failed :(');
			}
		});
});

app.listen(3000, () => console.log('Server running on port 3000'));
