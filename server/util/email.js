var nodemailer = require('nodemailer');
var crypto = require('crypto');


exports.sendNewUserMail = function(userEmail, emailHash) {
	var returnLink = "http://jnc8.azurewebsites.net?u=" + emailHash;	
	
	var transport = nodemailer.createTransport("SMTP", {
	        auth: {
	            user: "jnc8app@gmail.com",
	            pass: "M0xeH3alth!!"
	        }
	    });

	console.log('SMTP Configured');

	// Message object
	var message = {
    from: 'JNC8 Application <jnc8app@gmail.com>',
    to: '"JNC8 Application User" <' + userEmail + '>',
    subject: 'Your JNC8 Application Information', //
    text: 'Thanks for using the JNC8 application! If you\'re interested in tracking your treatment, save this link and return to it to add more information: ' + returnLink,
    html:'<p>Thanks for using the JNC8 application! If you\'re interested in tracking your treatment, save this link and return to it to add more information: <a href="' + returnLink +'">' + returnLink + '</p>'
	};

	console.log('Sending Mail');
	transport.sendMail(message, function(error){
	    if(error){
	        console.log('Error occured');
	        console.log(error.message);
	        return;
	    }
	    console.log('Message sent successfully!');

	    // if you don't want to use this transport object anymore, uncomment following line
	    //transport.close(); // close the connection pool
	});
};


