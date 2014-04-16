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

var emailOptions = {
	from: emailAuth.user,
	subject: 'Your information from the JNC8 treatment application',
	text: 'Plaintext body',
	html: 'HTML body'
};

smtpTransport.sendMail(emailOptions, function(error, response) {
	if(error) {
		console.log(error);
	} else {
		console.log('Message sent: ' + response.message);
	}

	smtpTransport.close();
});