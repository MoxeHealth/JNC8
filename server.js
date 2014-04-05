var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var db = require('./db-config')
var app = express();


// API information and headers
var baseUrl = 'http://substratestaging.moxehealth.com/api/2013-1/get';
var unPassEncoded = 'SFJKU0M4VGVzdEFwcDowN2FhODJiZTI4ODY=';
var headers = {
    'Content-type': 'application/json',
    'Authorization': 'Basic ' + unPassEncoded,
    'VendorID': 1, //Sandbox ID
    'OrganizationID': 3, //testing ID
    'EHRUserId': 'terry', //testing user
    'ApplicationKey': 'b6956ad2-ca01-45e6-ab57-4b51b99e70df'
  };


app.use(express.static(__dirname));
app.use(bodyParser());

app.post('/*',  function(req, res){
  console.log("Serving app.post...");
  var url = baseUrl + req.url;
  console.log("The url: " + url);
  req.pipe(request.post({uri: url, json: req.body, headers:headers})).pipe(res);
});

app.get('/', function(req,res){
  res.redirect('/app/index.html');
});



var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
