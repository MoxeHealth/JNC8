var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var db = require('./db-config')
var app = express();
var encrypt = require('./encrypt');
var email = require('./email');


exports.api = {
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
  var name = req.query.name;
  var queryString = 'name=' + name;
  
  if(req.query.dosage) {
    var dosage = req.query.dosage;
    queryString += '&dosage=' + dosage;
  }
  
  queryString += '&api_key=' + exports.api.goodRx.key;

  // make and base64 encode the hash
  var encodedString = encrypt.signUrl(queryString, exports.api.goodRx.secret);

  // append the base64 encoding onto the string
  var urlString = exports.api.goodRx.url + '?' + queryString + '&sig=' + encodedString;
  req.pipe(request.get(urlString)).pipe(res);
});


app.post('/db/encounters',  function(req, res){
  console.log('handling POST req...');
  var ptId = req.body.ptId;
  var orgId = req.body.orgId || 'NULL';
  var email = db.msString(req.body.encounter.email);
  var encounterDate = db.msString(new Date(req.body.encounter.encounterDate)) || db.msString(new Date());
  var bloodPressure = db.msString(req.body.encounter.bloodPressure);
  var targetBP = db.msString(req.body.encounter.targetBP);
  var prescribedMeds = db.msString(req.body.encounter.prescribedMeds);
  var removedMeds = db.msString(req.body.encounter.removedMeds);
  var currentMeds = db.msString(req.body.encounter.currentMeds);

  if(req.body.orgId) {
    var userHash = encrypt.makeEmailHash(req.body.encounter.email[0]) ;
  } else {
    var userHash = undefined;
  }


  var query = 'INSERT INTO dbo.encounters (pt_id, org_id, emails, encounter_date, blood_pressure, target_bp, prescribed_meds, removed_meds, current_meds) VALUES (' + ptId + ',' + orgId + ',' + email +',' + encounterDate + ',' + bloodPressure + ',' + targetBP +',' + prescribedMeds + ',' + removedMeds + ',' + currentMeds + ')';

  db.queryHelper(query, function(err, data){
    if(err) {
      console.log(err);
      res.send(err);
    } else {
      email.sendNewUserEmail(email, userHash);
      res.send(data);
    }
  });
});

//will handle post requests from unique urls that are given to people who sign up for the standalone app 
app.post('/*',  function(req, res){
  console.log("Serving app.post...");
  var url = exports.api.moxe.baseUrl + req.url;
  console.log("The url: " + url);
  req.pipe(request.post({uri: url, json: req.body, headers: exports.api.moxe.headers})).pipe(res);
});

var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
