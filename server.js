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

app.get('/db/encounters',  function(req, res){
  console.log('get db/encounters');
  var ptId = req.body.ptId;

  db.connection.query('SELECT * FROM `encounters` WHERE `patient_id` = ' + ptId, function(err, data){
    if(err){
      res.send(err);
      console.log('get from db failed');
    }else{
      res.send(data);
      console.log('data', data);
    }
  });
});

app.post('/db/encounters',  function(req, res){
  console.log('post db/encounters');
  var ptId = req.body.ptId;
  var encounterDate = db.connection.escape(new Date().toISOString().slice(0, 19).replace('T', ' '));
  var bloodPressure = db.connection.escape(JSON.stringify(req.body.encounter.bloodPressure));
  var medicationsPrescribed = db.connection.escape(JSON.stringify(req.body.encounter.medicationsPrescribed));

  console.log('ptId', ptId);
  console.log('encounterDate', encounterDate);
  console.log('bloodPressure', bloodPressure);
  console.log('medicationsPrescribed', medicationsPrescribed);

  db.connection.query('INSERT INTO `encounters` (patient_id, encounter_date, blood_pressure, medications_prescribed) VALUES (' + ptId + ',' + encounterDate + ',' + bloodPressure + ',' +medicationsPrescribed + ')', function(err, data){
    if(err){
      console.log('insert failed');
      console.log(err);
      res.send(err);
    }else{
      res.send(data)
    }
  });
});

//SELECT '3430000' FROM `patients` LEFT JOIN (`encounters`) ON (`encounters`.id_patients = `patients`.id)

app.post('/*',  function(req, res){
  console.log("Serving app.post...");
  var url = baseUrl + req.url;
  console.log("The url: " + url);
  req.pipe(request.post({uri: url, json: req.body, headers:headers})).pipe(res);
});

app.get('/db',  function(req, res){
  console.log("Serving app.get from db");
  var url = baseUrl + req.url;
  console.log("The url: " + url);
});

app.get('/', function(req,res){
  res.redirect('/app/index.html');
});



var port = process.env.PORT || 8000;

app.listen(port);

console.log('Server now listening on port ' + port);
