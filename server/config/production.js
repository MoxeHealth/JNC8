exports.moxe = {
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
};

exports.goodRx = {
  url: 'https://api.goodrx.com/low-price',
  key: 'ef08ec276e',
  secret: 'bYiIVq2mv+GsSqtYrjjNqQ=='
};
