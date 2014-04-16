var nodemailer = require('nodemailer');

var emailAuth = {
	user: 'example@gmail.com',
	pass: 'thepassword'
};

var smtpTransport = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: emailAuth.user,
		password: emailAuth.pass
	}
});

exports.sendMail = function(userEmail) {
	var emailOptions = {
		from: emailAuth.user,
		to: userEmail,
		subject: 'Your information from the JNC8 treatment application',
		text: 'Plaintext body about how to log back into the application',
		html: 'HTML body about how to log back into the application'
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
