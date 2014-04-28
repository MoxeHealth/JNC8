var nodemailer = require('nodemailer');
var crypto = require('crypto');

var emailAuth = {
	user: 'jnc8app@gmail.com',
	pass: 'M0x3Health!!'
};

var smtpTransport = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: emailAuth.user,
		password: emailAuth.pass
	}
});

exports.sendNewUserMail = function(userEmail, emailHash) {
	var returnLink = "http://jnc8.azurewebsites.net/#/returning?uid=" + emailHash;	

	var emailOptions = {
		from: emailAuth.user,
		to: userEmail,
		subject: 'Your information from the JNC8 treatment application',
		text: 'Plaintext body about how to log back into the application: ' + returnLink,
		html: 'HTML body about how to log back into the application: <a href="' + returnLink + '">' + returnLink + '</a>'
	};

	smtpTransport.sendMail(emailOptions, function(error, response) {
		if(error) {
			console.log(error);
		} else {
			console.log('Message sent: ' + response.message);
		}
		smtpTransport.close();
	});
};


