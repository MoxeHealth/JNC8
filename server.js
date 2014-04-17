var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var db = require('./db-config')
var app = express();
var crypto = require('crypto');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;


var api = {
  moxe: {
    baseUrl: 'http://substratestaging.moxehealth.com/api',
    year2013: '/2013-1/get',
    year2014: '/2014-1/get',
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

  //todo - parse back into correct var names "blood_pressure" --> "bloodPressure"
  console.log('get db/encounters');
  var ptId = req.query.ptId;
  var orgIdString;

  // handle the possibility that orgId is undefined
  if(req.query.orgId) {
    orgIdString = ' = ' + req.query.orgId;
  } else {
    orgIdString = ' is NULL';
  }

  // prep the query
  var query  = 'SELECT * FROM dbo.encounters WHERE pt_id = ' + ptId + ' AND org_id' + orgIdString;

  db.queryHelper(query, function(err, rows, other) {
    if(err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

app.get('/goodrx/low-price', function(req, res) {
  console.log('into GET goodrx/low-price');

  var signUrl = function(name) {

  };

  var escapeRegExp = function (string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  };

  var replaceAll = function (find, replace, str) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }



  // pull the data out of the query
  var name = req.query.name;
  name = name.toUpperCase();
  var queryString = 'name=' + name;
  if(req.query.dosage) {
    var dosage = req.query.dosage;
    queryString += '&dosage=' + dosage;
  }

  // construct the query string to be encoded with the hash
   queryString += '&api_key=' + api.goodRx.key;

  console.log(queryString);

  // make and base64 encode the hash
  var hmac = crypto.createHmac('sha256', api.goodRx.secret);
  hmac.update(queryString);
  var encodedString = hmac.digest('base64');

  encodedString = replaceAll('+', "_", encodedString);
  encodedString = replaceAll('/', "_", encodedString);
  encodedString = encodeURIComponent(encodedString);

  // append the base64 encoding onto the string
  var urlString = api.goodRx.url + '?' + queryString + '&sig=' + encodedString;
  console.log(urlString);

  //forward the request and pipe 
  req.pipe(request.get(urlString)).pipe(res);
});

app.post('/db/encounters',  function(req, res){
  console.log('post db/encounters');

  var msString = function(target) {
    if(typeof target === 'string') {
      return target;
    } else if(target instanceof Date) {
      return '\'' + target.toISOString().slice(0, 19).replace('T', ' ') + '\'';
    } else {
      return '\'' + JSON.stringify(target) + '\'' || 'NULL';
    }
  };

  // there must be a better way to do this...
  var ptId = req.body.ptId;
  var orgId = req.body.orgId || 'NULL';
  var email = msString(req.body.encounter.email);
  var encounterDate = msString(new Date(req.body.encounter.encounterDate)) || msString(new Date());
  var bloodPressure = msString(req.body.curBP);
  var targetBP = msString(req.body.encounter.targetBP);
  var prescribedMeds = msString(req.body.encounter.prescribedMeds);
  var removedMeds = msString(req.body.encounter.removedMeds);
  var curMeds = msString(req.body.encounter.curMeds);

  var query = 'INSERT INTO dbo.encounters (pt_id, org_id, emails, encounter_date, blood_pressure, target_bp, prescribed_meds, removed_meds, current_meds) VALUES (' + ptId + ',' + orgId + ',' + email +',' + encounterDate + ',' + bloodPressure + ',' + targetBP +',' + prescribedMeds + ',' + removedMeds + ',' + curMeds + ')';

  db.queryHelper(query, function(err, data){
    if(err) {
      console.log(err);
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

//will handle post requests from unique urls that are given to people who sign up for the standalone app 
app.post('/*',  function(req, res){
  console.log("Serving app.post...");

  //labs endpoint is now year2014
  if(req.url === '/patient/labs'){
    var url = api.moxe.baseUrl + api.moxe.year2014 + req.url;
  //other endpoints are still year2013 but will be changed soon (comment 4/16/14)
  }else{
    var url = api.moxe.baseUrl + api.moxe.year2013 + req.url;
  }
  console.log("The url: " + url);
  req.pipe(request.post({uri: url, json: req.body, headers: api.moxe.headers})).pipe(res);
});

var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
