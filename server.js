var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

require('./route-handler')(app);

app.use(express.static(__dirname));
app.use(bodyParser({strict: false}));

var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
