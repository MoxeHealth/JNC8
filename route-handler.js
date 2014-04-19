var request = require('request');
var db = require('./db-config')
var encrypt = require('./encrypt');
var email = require('./email');
var saml = require('saml20');
var bodyParser = require('body-parser');
var db = require('./db-config')

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

  app.get('/', function(req,res){
    // check to see if there's a user id parameter
    // if there is, run a query through the DB to see if that user id exists; return with data if it does
    // send res.redirect to '/new with information'
    if(req.query.uid) {
      res.redirect('/app/#/returning?uid='+req.query.uid);
      
    } else {
      console.log("Serving a vanilla GET to '/'")
      res.redirect('/app');
    }
  });

  app.get('/db/returning', function(req, res) {
    console.log('get db/returning');
    var query = db.makeUserQuery(req.query.uid);
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

  app.post('/db/encounters',  function(req, res){
    console.log('post db/encounters');

    var msString = function(target) {
      if(typeof target === 'string') {
        console.log('target string', target );
        return target;
      } else if(target instanceof Date) {
        console.log('target Date', target );
        return '\'' + target.toISOString().slice(0, 19).replace('T', ' ') + '\'';
      } else {
        return '\'' + JSON.stringify(target) + '\'' || 'NULL';
      }
    };

    console.log('req', req.body);
    // there must be a better way to do this... pulling data from the req object and normalizing it
    var ptId = req.body.ptId;
    var orgId = req.body.orgId || 'NULL';
    var emails = msString(req.body.encounter.emails) || 'NULL';
    var emailHash = msString(req.body.encounter.emailHash) || 'NULL';
    var encounterDate = msString(new Date());
    var curBP = msString(req.body.encounter.curBP) || 'NULL';
    var targetBP = msString(req.body.encounter.targetBP) || 'NULL';
    var curMeds = msString(req.body.encounter.curMeds) || 'NULL';
    var age = msString(req.body.encounter.age) || 'NULL';
    var race = msString(req.body.encounter.race) || 'NULL';
    var hasCKD = msString(req.body.encounter.hasCKD) || 'NULL';
    var hasDiabetes = msString(req.body.encounter.hasDiabetes) || 'NULL';

    if(req.body.orgId) {
      var userHash = encrypt.makeEmailHash(req.body.encounter.email[0]) ;
    } else {
      var userHash = undefined;
    }

    var query = 'INSERT INTO dbo.encounters (ptId, orgId, emails, emailHash, encounterDate, curBP, targetBP, curMeds, age, race, hasCKD, hasDiabetes) VALUES (' + ptId + ',' + orgId + ',' + emails + ',' + emailHash + ',' + encounterDate + ',' + curBP + ',' + targetBP +',' + curMeds +',' + age + ',' + race +',' + hasCKD +',' + hasDiabetes +')';

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

  app.post('/authenticate', function(req, res) {
    console.log('fielding /authenticate request');

    var thumbprint = "MIIC2jCCAcKgAwIBAgIQFC2VkNtdfJtAMS1n4G1JYDANBgkqhkiG9w0BAQUFADAWMRQwEgYDVQQDEwtNYXVsaWstTW94ZTAeFw0xMzExMjIwMTI3MTJaFw0xNDExMjEwMDAwMDBaMBYxFDASBgNVBAMTC01hdWxpay1Nb3hlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt3J1ns4AcOsQ2UYXqNxtLHVoQwUqFC/d15t06xN378OO0wByuHsBC43NANr3leqJW7AOr0YQ30ZmlavXu8kuYjYo7aPT15SzQNKJJla5KngngLb0r0W54eh/dkX2/iaFRp9ACD62F+mPVmiSWr8NuScvMc6oqeAcAUdZAkpwr+TjY3EXvqbrSUydnJiBcfc+ZCAcfLj1zpxmY4vl44isE/qFq2cRbo3+Wdal3i4LHZVuT1lR3usb2oKlIr1phyMcQR03He/S9l//ysMS6v+FaPWnM7rtxMOAQ6jgQeYjS6k72oXpjIpIbNKM9/K4EOENyK/SlRLhto1Vmp8AMfyA5QIDAQABoyQwIjALBgNVHQ8EBAMCBDAwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDQYJKoZIhvcNAQEFBQADggEBACwk4fpW6yPZJKtifdIP5kbCVS+JMw6/ROxt8QbWeQ37uEiexq6jfuunumEW3WtlUjgNcQ7gpSd1Sv6bIRS+KDgyFJAtxwiV1Mad8yYuutgJrXblX/6v6yQImg6d+Zru91Defef9Kg3LaJdJJCIqONolm9eDlAMrOIIEiKZY3tfnjfy5QeXAAdQjaHeQ9HUblyjLhbSjPypXvgcfMyD8pPXnRXg9jKQMkq+RxWZRWvW5YE5sexLsZEEOL21BV1aU2uE7epCf1+czJtSJkJpJhxRh17JYNZsYAU1XIai7oJbdkto2dzFl3VvULlfxdR0WoBw0I";
    var options = { thumbprint: thumbprint,
      audience: 'https://jnc8.azurewebsites.net/authenticate'
    };
    
    var body = '';
    req.on('data', function(data){ 
      body += data;
    });

    req.on('end', function() {
      var b64Assertion = body.split('=')[1];
      b64Assertion = decodeURIComponent(b64Assertion);
      var rawAssertion = new Buffer(b64Assertion, 'base64').toString('utf8');

      console.log('rawAssertion: ', rawAssertion);

      saml.validate(rawAssertion, options, function(err, profile) {
        if(err) throw new Error('SAML error:' + err);

        console.log("SAML profile: ", profile);
        var claims = profile.claims;
        var issuer = profile.issuer;

        console.log('SAML claims:', claims);
      });
    });

    console.log(rawAssertion);
  });


  //will handle post requests from unique urls that are given to people who sign up for the standalone app 
  app.post('/*',  function(req, res){
    // console.log("Serving app.post...");

    //labs endpoint is now year2014
    if(req.url === '/patient/labs'){
      var url = api.moxe.baseUrl + api.moxe.year2014 + req.url;
    //other endpoints are still year2013 but will be changed soon (comment 4/16/14)
    }else{
      var url = api.moxe.baseUrl + api.moxe.year2013 + req.url;
    }

    // console.log("The url: " + url);
    req.pipe(request.post({uri: url, json: req.body, headers: api.moxe.headers})).pipe(res);
  });
};