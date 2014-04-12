var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
// var helpers = require('./helpers');
var db = require('./db-config')
var app = express();
var crypto = require('crypto');


var api = {
  moxe: {
    baseUrl: 'http://substratestaging.moxehealth.com/api/2013-1/get',
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Basic SFJKU0M4VGVzdEFwcDowN2FhODJiZTI4ODY=',
      'VendorID': 1, //Sandbox ID
      'OrganizationID': 3, //testing ID
      'EHRUserId': 'terry', //testing user
      'ApplicationKey': 'b6956ad2-ca01-45e6-ab57-4b51b99e70df'
    }
  },
  goodRx: {
    url: 'https://api.goodrx.com/low-price',
    key: 'ef08ec276e',
    secret: 'bYiIVq2mv+GsSqtYrjjNqQ=='
  }
};

app.use(express.static(__dirname));
app.use(bodyParser());

app.get('/', function(req,res){
  res.redirect('/app/index.html');
});

//The SQL database stores any information that must be persisted but cannot be written back to the EMR
app.get('/db/encounters',  function(req, res){
  console.log('get db/encounters');
  var ptId = req.query.ptId;
  var orgIdString;

  // handle the possibility that orgId is undefined
  if(req.query.orgId) {
    orgIdString = ' = ' + req.query.orgId;
  } else {
    orgIdString = ' is NULL';
  }

  var query  = 'SELECT * FROM `encounters` WHERE `pt_id` = ' + ptId + ' AND `org_id`' + orgIdString;

  db.connection.query(query, function(err, data){
      if(err){
        res.send(err);
        console.log('get from db failed');
      }else{
        res.send(data);
      }
  });
});

app.get('/db',  function(req, res){
  console.log("Serving app.get from db");
  var url = api.moxe.baseUrl + req.url;
  console.log("The url: " + url);
});

app.post('/db/encounters',  function(req, res){
  console.log('post db/encounters');
  console.log(req.body);
  var ptId = db.connection.escape(req.body.ptId);
  var orgId = db.connection.escape(req.body.orgId) || 'NULL';
  var emails = db.connection.escape(JSON.stringify(req.body.emails)) || 'NULL';
  var encounterDate = db.connection.escape(new Date().toISOString().slice(0, 19).replace('T', ' '));
  var bloodPressure = db.connection.escape(JSON.stringify(req.body.encounter.bloodPressure)) || 'NULL';
  var targetBP = db.connection.escape(JSON.stringify(req.body.encounter.targetBP)) || 'NULL';
  var prescribedMeds = db.connection.escape(JSON.stringify(req.body.encounter.prescribedMeds)) || 'NULL';
  var removedMeds = db.connection.escape(JSON.stringify(req.body.encounter.removedMeds)) || 'NULL';
  var currentMeds = db.connection.escape(JSON.stringify(req.body.encounter.currentMeds)) || 'NULL';

  console.log(ptId);
  console.log(orgId);
  console.log(emails);
  console.log(encounterDate);
  console.log(bloodPressure);
  console.log(targetBP);
  console.log(prescribedMeds);
  console.log(removedMeds);
  console.log(currentMeds);

  var query = 'INSERT INTO `encounters` (pt_id, org_id, emails, encounter_date, blood_pressure, target_bp, prescribed_meds, removed_meds, current_meds) VALUES (' + ptId + ',' + orgId + ',' + emails + ',' + encounterDate + ',' + bloodPressure + ',' + targetBP + ',' + prescribedMeds + ',' + removedMeds + ',' + currentMeds +')';

  console.log(query);

  db.connection.query(query, function(err, data){
    if(err){
      console.log('insert failed');
      console.log(err);
      res.send(err);
    }else{
      res.send(data);
    }
  });
});

app.get('/goodrx/low-price', function(req, res) {
  console.log('into GET goodrx/low-price');

  // pull the data out of the query
  var name = encodeURIComponent(req.query.name);

  // construct the query string to be encoded with the hash
  var reqString = 'name=' + name + '&api_key=' + api.goodRx.key;

  // make and base64 encode the hash
  var hmac = crypto.createHmac('sha256', api.goodRx.secret);
  hmac.update(reqString);
  var encodedString = encodeURIComponent(hmac.digest('base64').replace("+", "_").replace("/", "_"));

  // append the base64 encoding onto the string
  var urlString = api.goodRx.url + '?' + reqString + '&sig=' + encodedString;

  console.log(urlString);

  //forward the request and pipe 
  req.pipe(request.get(urlString)).pipe(res);
});

//will handle post requests from unique urls that are given to people who sign up for the standalone app 
app.post('/*',  function(req, res){
  console.log("Serving app.post...");
  var url = api.moxe.baseUrl + req.url;
  console.log("The url: " + url);
  req.pipe(request.post({uri: url, json: req.body, headers: api.moxe.headers})).pipe(res);
});

var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
