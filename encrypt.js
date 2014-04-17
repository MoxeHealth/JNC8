var crypto = require('crypto');
var server = require('./server')

exports.signUrl = function(queryString, secret) {
  var hmac = crypto.createHmac('sha256', server.api.goodRx.secret);
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