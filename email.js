var nodemailer = require('nodemailer');
//todo - take out if smtpTransport works; not seeing crypto needed anywhere
var crypto = require('crypto');

var emailAuth = {
	user: 'ianlyo@gmail.com',
	pass: '4nd1am0!!'
};


// var emailAuth = {
// 	user: 'jnc8test@yahoo.com',
// 	pass: 'Test1234'
// }

var smtpTransport = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: emailAuth.user,
		password: emailAuth.pass
	},
	address: 'smtp.gmail.com',
	port: 25,
	authentication: 'plain',
	enable_starttls_auto: true
});

exports.sendNewUserEmail = function(userEmail, emailHash) {
	var returnLink = "http://jnc8.azurewebsites.net?u=" + emailHash;	

	var emailOptions = {
		from: emailAuth.user,
		to: userEmail,
		subject: 'Your information from the JNC8 treatment application',
		text: 'Plaintext body about how to log back into the application: ' + returnLink,
		html: 'HTML body about how to log back into the application: <a href="' + returnLink + '">' + returnLink + '</a>'
	};

	smtpTransport.sendMail(emailOptions, function(error, response) {
		console.log('emailOptions', emailOptions);
		if(error) {
			console.log('smtpTransport error', error);
			console.log(error.message);
		} else {
			console.log('Message sent: ' + response.message);
		}
		smtpTransport.close();
	});
};


