var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var db = require('./db-config')
var app = express();
var encrypt = require('./encrypt');
var email = require('./email');
var saml = require('saml20');
require('./route-handler')(app);




app.use(express.static(__dirname));
app.use(bodyParser({strict: false}));


var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
