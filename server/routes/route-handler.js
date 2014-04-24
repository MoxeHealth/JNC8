var request = require('request');
var express = require('express');
var encrypt = require('../util/encrypt');
var email = require('../util/email');
var samlHelpers = require('../util/saml.js');
var saml = require('saml20');
var bodyParser = require('body-parser');
var dbConfig = require('../models/db-config');
var dbHelp = require('../controllers/db-helpers');
var crypto = require('crypto');
var apis = require('../config/production')

var localStorage = {};

module.exports = function(app) {
  
  app.use(express.static(__dirname + '/../../app'));
  app.use(bodyParser({strict: false}));

  app.get('/', function(req,res){
    // check to see if there's a user id parameter
    // if there is, run a query through the DB to see if that user id exists; return with data if it does
    // send res.redirect to '/new with information'
    if(req.query.uid) {
      res.redirect('/#/returning?uid='+req.query.uid);
    } else {
      res.send('/index.html');
    }
  });

  app.get('/db/returning', function(req, res) {
    console.log('get db/returning');
    var query = dbHelp.makeUserQuery(req.query.uid);
    console.log('db returning query', query);
    dbHelp.queryHelper(query, function(err, rows) {
      if(err) {
        res.send(err);
      } else {
        res.send(rows);
      }
    });
  });

  app.get('/db/encounters',  function(req, res){
    var ptId = req.query.ptId;
    var orgIdString;

    v

    // handle the possibility that orgId is undefined
    if(req.query.orgId) {
      orgIdString = ' = ' + req.query.orgId;
    } else {
      orgIdString = ' is NULL';
    }

    // prep the query
    var query  = 'SELECT * FROM dbo.encounters WHERE ptId = ' + ptId + ' AND orgId' + orgIdString;

    dbHelp.queryHelper(query, function(err, rows, other) {
      if(err) {
        res.send(err);
      } else {
        res.send(rows);
      }
    });
  });

  app.get('/goodrx/low-price', function(req, res) {
    var queryString = dbHelp.makeQueryString(req.query, apis.goodRx.key);
    // make and base64 encode the hash
    var encodedString = encrypt.signUrl(queryString, apis.goodRx.secret);
    // append the base64 encoding onto the string
    var urlString = apis.goodRx.url + '?' + queryString + '&sig=' + encodedString;
    req.pipe(request.get(urlString)).pipe(res);
  });

  // standalone users and moxe users at the end of a patient encounter 
  app.post('/db/encounters', function(req, res){
    console.log('post db/encounters');
    // there must be a better way to do this... pulling data from the req object and normalizing it
    var stringifyParams = function(params) {
      
    };
    var emailHash = dbHelp.msString(req.body.encounter.emailHash);
    var ptId = dbHelp.msString(req.body.ptId);
    var orgId = dbHelp.msString(req.body.orgId);
    var emails = dbHelp.msString(req.body.encounter.emails);
    var encounterDate = dbHelp.msString(new Date());
    var curBP = dbHelp.msString(req.body.encounter.curBP);
    var curTargetBP = dbHelp.msString(req.body.encounter.curTargetBP);
    var curMeds = dbHelp.msString(req.body.encounter.curMeds);
    var age = dbHelp.msString(req.body.encounter.age);
    var race = dbHelp.msString(req.body.encounter.race);
    var hasCKD = dbHelp.msString(req.body.encounter.hasCKD);
    var hasDiabetes = dbHelp.msString(req.body.encounter.hasDiabetes);

    if(!req.body.orgId && req.body.ptId) {
      //emailHashString is the same as emailHash, but not stringified
      var emailHashString = encrypt.makeEmailHash(ptId);
      console.log('typeof emailHashString', typeof emailHashString);
    } else {
      var emailHashString = undefined;
    }

    //first time user will have emailHash of 'NULL'
    if(emailHash === 'NULL'){
      emailHash = dbHelp.msString(emailHashString);
    }

    console.log('emailHash after encrypt', emailHash);
    console.log('ptId', ptId);
    console.log('orgId', orgId);
    var query = 'INSERT INTO dbo.encounters (ptId, orgId, emails, emailHash, encounterDate, curBP, curTargetBP, curMeds, age, race, hasCKD, hasDiabetes) VALUES (' + ptId + ',' + orgId + ',' + emails + ',' + emailHash + ',' + encounterDate + ',' + curBP + ',' + curTargetBP +',' + curMeds +',' + age + ',' + race +',' + hasCKD +',' + hasDiabetes +')';

    console.log('query', query);

    var messageRecipient = req.body.encounter.emails[0];
    console.log('Sending an email to ' + messageRecipient);
    email.sendNewUserMail(messageRecipient, emailHashString);


    dbHelp.queryHelper(query, function(err, data){
      if(err) {
        console.log(err);
        res.send("There was an error:" + err);
      } else {
        res.send("We successfully saved your information to the database and sent you an email with a link for follow-up visits.");
      }
    });
  });

  //moxe users access the app via a SAML POST request 
  app.post('/authenticate', function(req, res) {

    var thumbprint = "MIIC2jCCAcKgAwIBAgIQFC2VkNtdfJtAMS1n4G1JYDANBgkqhkiG9w0BAQUFADAWMRQwEgYDVQQDEwtNYXVsaWstTW94ZTAeFw0xMzExMjIwMTI3MTJaFw0xNDExMjEwMDAwMDBaMBYxFDASBgNVBAMTC01hdWxpay1Nb3hlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt3J1ns4AcOsQ2UYXqNxtLHVoQwUqFC/d15t06xN378OO0wByuHsBC43NANr3leqJW7AOr0YQ30ZmlavXu8kuYjYo7aPT15SzQNKJJla5KngngLb0r0W54eh/dkX2/iaFRp9ACD62F+mPVmiSWr8NuScvMc6oqeAcAUdZAkpwr+TjY3EXvqbrSUydnJiBcfc+ZCAcfLj1zpxmY4vl44isE/qFq2cRbo3+Wdal3i4LHZVuT1lR3usb2oKlIr1phyMcQR03He/S9l//ysMS6v+FaPWnM7rtxMOAQ6jgQeYjS6k72oXpjIpIbNKM9/K4EOENyK/SlRLhto1Vmp8AMfyA5QIDAQABoyQwIjALBgNVHQ8EBAMCBDAwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDQYJKoZIhvcNAQEFBQADggEBACwk4fpW6yPZJKtifdIP5kbCVS+JMw6/ROxt8QbWeQ37uEiexq6jfuunumEW3WtlUjgNcQ7gpSd1Sv6bIRS+KDgyFJAtxwiV1Mad8yYuutgJrXblX/6v6yQImg6d+Zru91Defef9Kg3LaJdJJCIqONolm9eDlAMrOIIEiKZY3tfnjfy5QeXAAdQjaHeQ9HUblyjLhbSjPypXvgcfMyD8pPXnRXg9jKQMkq+RxWZRWvW5YE5sexLsZEEOL21BV1aU2uE7epCf1+czJtSJkJpJhxRh17JYNZsYAU1XIai7oJbdkto2dzFl3VvULlfxdR0WoBw0I";
    var options = { thumbprint: thumbprint,
      audience: 'http://jnc8.azurewebsites.net/authenticate'

    };

    var randomHash = crypto.randomBytes(20).toString('hex');
    
    // get the data
    var body = '';
    req.on('data', function(chunk){ 
      body += chunk;
    });

    req.on('end', function() {
      var assertionNode = samlHelpers.getSamlNode(body);

      /* okay, so this is interesting: the XML namespacing in the SAML response throws all kinds of errors with this saml20 library. i have a temporary, hacky solution built directly into the parser in node_modules/saml20/lib/saml20.js, but am planning to write it into the library and submit a pull request */
      saml.parse(assertionNode, function(err, profile) {
        var claimsDetails = samlHelpers.getClaimsDetails(err, profile);
        localStorage[randomHash] = claimsDetails;
      });

    });
    res.redirect('/#/moxe?sid='+randomHash);
  });

  app.get('/moxe/userData', function(req, res) {
    var sid = req.query.sid;
    var claimsInfo = localStorage[sid];
    res.send(claimsInfo);
  });


  //will handle post requests from unique urls that are given to people who sign up for the standalone app 
  app.post('/*',  function(req, res){
    //labs endpoint is now year2014
    if(req.url === '/patient/labs'){
      var url = apis.moxe.baseUrl + apis.moxe.year2014 + req.url;
      //other endpoints are still year2013 but will be changed soon (comment 4/16/14)
    }else{
      var url = apis.moxe.baseUrl + apis.moxe.year2013 + req.url;
    }
    req.pipe(request.post({uri: url, json: req.body, headers: apis.moxe.headers})).pipe(res);
  });
};