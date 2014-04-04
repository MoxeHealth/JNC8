var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var baseUrl = 'http://substratestaging.moxehealth.com/api/2013-1/get/patient';
var apiPaths = {
  demographics: 'demographics',
  vitals: 'vitals',
  labs: 'labs'
};
var unPassEncoded = 'SFJKU0M4VGVzdEFwcDowN2FhODJiZTI4ODY=';
var headers = {
    'Content-type': 'application/json',
    'Authorization': 'Basic ' + unPassEncoded,
    'VendorID': 1, //Sandbox ID
    'OrganizationID': 3, //testing ID
    'EHDUserId': 'terry', //testing user
    'ApplicationKey': 'b6956ad2-ca01-45e6-ab57-4b51b99e70df'
  };

// var setHeaders = function(req, res, next){
//   console.log("setHeaders being called");

//   next();
// };

app.use(express.static(__dirname)); //maps to 'public'
app.use(bodyParser());

app.post('/*',  function(req, res){
  console.log("Serving app.post...");
  var url = baseUrl + req.url;
  res.writeHead(200, headers);
  console.log("The url: " + url);

  request.post({uri: url, json: req.body, headers: headers}, function (e, r, body) {
    if(e){
      console.log('e', e);
    }else{
      // console.log('r', r);
      req.pipe(r).pipe(res);
      console.log('body', body);
    }
  });
});

app.get('/', function(req,res){
  res.redirect('/app/index.html');
});

var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
