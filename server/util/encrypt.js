var crypto = require('crypto');
var route = require('../routes/route-handler');

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


exports.signUrl = function(queryString, secret) {
	console.log(route);
  var hmac = crypto.createHmac('sha256', api.goodRx.secret);
  hmac.update(queryString);
  var encodedString = makeUrlSafe(hmac.digest('base64'));
  return encodedString;
};

exports.makeEmailHash = function(userEmail) {
	var salt = 'qTg21o76o9uhas;dnals+2KvN4qPJLFvy7qP6P';
	var hash = crypto.createHash('sha256');
	hash.update(userEmail);
	hash.update(salt);
	var safeHash = makeUrlSafe(hash.digest('base64'));
	console.log(safeHash);
	return safeHash;
};

var makeUrlSafe = function(string) {
	string = replaceAll('+', "_", string);
	string = replaceAll('/', "_", string);
	return encodeURIComponent(string);
};

var escapeRegExp = function (string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

var replaceAll = function (find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};