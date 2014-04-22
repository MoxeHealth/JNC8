var request = require('request');
var encrypt = require('./utility/encrypt');
var email = require('./utility/email');
var samlHelpers = require('./utility/saml.js');
var saml = require('saml20');
var bodyParser = require('body-parser');
var db = require('./db-config');
var crypto = require('crypto');

var localStorage = {};

module.exports = function(app) {
  api = {
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
  app.use(bodyParser({strict: false}));

  app.get('/', function(req,res){
    // check to see if there's a user id parameter
    // if there is, run a query through the DB to see if that user id exists; return with data if it does
    // send res.redirect to '/new with information'
    if(req.query.uid) {
      console.log(req.query.uid);
      res.redirect('/app/#/returning?uid='+req.query.uid);
    } else {
      console.log("Serving a vanilla GET to '/'")
      res.redirect('/app');
    }
  });

  app.get('/db/returning', function(req, res) {
    console.log('get db/returning');
    var query = db.makeUserQuery(req.query.uid);
    console.log('db returning query', query);
    db.queryHelper(query, function(err, rows) {
      if(err) {
        res.send(err);
      } else {
        res.send(rows);
      }
    });
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

    // prep the query
    var query  = 'SELECT * FROM dbo.encounters WHERE ptId = ' + ptId + ' AND orgId' + orgIdString;

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
    
    queryString += '&api_key=' + api.goodRx.key;

    // make and base64 encode the hash
    var encodedString = encrypt.signUrl(queryString, api.goodRx.secret);

    // append the base64 encoding onto the string
    var urlString = api.goodRx.url + '?' + queryString + '&sig=' + encodedString;
    req.pipe(request.get(urlString)).pipe(res);
  });

  // standalone users and moxe users at the end of a patient encounter 
  app.post('/db/encounters', function(req, res){
    console.log('post db/encounters');

    //convert each target into a string that can be inserted into the database 


    // there must be a better way to do this... pulling data from the req object and normalizing it
    var ptId = db.msString(req.body.ptId);
    var orgId = db.msString(req.body.orgId);
    var emails = db.msString(req.body.encounter.emails);
    var emailHash = db.msString(req.body.encounter.emailHash);
    var encounterDate = db.msString(new Date());
    var curBP = db.msString(req.body.encounter.curBP);
    var curTargetBP = db.msString(req.body.encounter.curTargetBP);
    var curMeds = db.msString(req.body.encounter.curMeds);
    var age = db.msString(req.body.encounter.age);
    var race = db.msString(req.body.encounter.race);
    var hasCKD = db.msString(req.body.encounter.hasCKD);
    var hasDiabetes = db.msString(req.body.encounter.hasDiabetes);

    if(!req.body.orgId && req.body.ptId) {
      //emailHashString is the same as emailHash, but not stringified
      var emailHashString = encrypt.makeEmailHash(ptId);
      console.log('typeof emailHashString', typeof emailHashString);
    } else {
      var emailHashString = undefined;
    }

    //first time user will have emailHash of 'NULL'
    if(emailHash === 'NULL'){
      emailHash = msString(emailHashString);
    }

    console.log('emailHash after encrypt', emailHash);
    console.log('ptId', ptId);
    console.log('orgId', orgId);
    var query = 'INSERT INTO dbo.encounters (ptId, orgId, emails, emailHash, encounterDate, curBP, curTargetBP, curMeds, age, race, hasCKD, hasDiabetes) VALUES (' + ptId + ',' + orgId + ',' + emails + ',' + emailHash + ',' + encounterDate + ',' + curBP + ',' + curTargetBP +',' + curMeds +',' + age + ',' + race +',' + hasCKD +',' + hasDiabetes +')';

    console.log('query', query);

    //get user email in format that can be used in smtp request made
    //by sendNewUserEmail function
    var messageRecipient = req.body.encounter.emails[0];
    // var returnLink = "http://jnc8app.azurewebsites.net?uid=" + emailHashString;
    var returnLink = "http://localhost:8000?uid=" + emailHashString;
    console.log('emailHash', emailHash)
    db.queryHelper(query, function(err, data){
      if(err) {
        console.log(err);
        res.send(err);
      } else {
        //currently getting '[Error: Authentication required, invalid details provided]'
        // email.sendNewUserEmail(messageRecipient, emailHashString);
        res.send(returnLink);
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
    res.redirect('/app/#/moxe?sid='+randomHash);
  });

  app.get('/moxe/userData', function(req, res) {
    var sid = req.query.sid;
    var claimsInfo = localStorage[sid];
    res.send(claimsInfo);
  });


  //will handle post requests from unique urls that are given to people who sign up for the standalone app 
  //todo- shouldn't this be a get? 
  app.post('/*',  function(req, res){
    //labs endpoint is now year2014
    if(req.url === '/patient/labs'){
      var url = api.moxe.baseUrl + api.moxe.year2014 + req.url;
      //other endpoints are still year2013 but will be changed soon (comment 4/16/14)
    }else{
      var url = api.moxe.baseUrl + api.moxe.year2013 + req.url;
    }
    req.pipe(request.post({uri: url, json: req.body, headers: api.moxe.headers})).pipe(res);
  });
};