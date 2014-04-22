exports.getSamlNode = function(b64string) {
  // this gets takes a base64-encoded SAML request string and returns just the assertion string
  var b64Assertion = decodeURIComponent(b64string.split('=')[1]);
  var xml = new Buffer(b64Assertion, 'base64').toString('utf8');
  var startLoc = xml.indexOf('<saml:Assertion');
  var endLoc = xml.indexOf('</saml:Assertion>', startLoc) + 17; // 17 is the length of the closing tag for the assertion
  return xml.substring(startLoc, endLoc);
};


exports.getClaimsDetails = function(err, profile) {
	if(err) {
		console.log('SAML parse error in getClaimsDetails: ', err);
	} else {
		var claimsDetails = {}
		claimsDetails.userId = profile.claims['urn:moxehealth:webapi:2013:saml.assertion.userid']['#'];
		claimsDetails.ptId = profile.claims['urn:moxehealth:webapi:2013:saml.assertion.patientid']['#'];
		claimsDetails.orgId = profile.claims['urn:moxehealth:webapi:2013:saml.assertion.organizationcode']['#'].replace('ORG#', '');
		claimsDetails.vendorId = profile.claims['urn:moxehealth:webapi:2013:saml.assertion.vendorid']['#'].replace('VEN#', '');
		return claimsDetails;
	}
};