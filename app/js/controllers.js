'use strict';

/* Controllers */



angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$http', '$log', function($http, $log) {

  	var endpointUrl = 'http://substratestaging.moxehealth.com/api/2013-1/get/patient/demographics';
  	var unPassEncoded = 'SFJKU0M4VGVzdEFwcDowN2FhODJiZTI4ODY=';
  	
  	var getPatientDemoInfo = function(patientId) {
  		console.log('getPatientDemoInfo is being run.');
	  	$http({
	  		url: endpointUrl,
	  		method: 'POST',
	  		headers: {
	  			'Content-type': 'application/json',
	  			'Authorization': 'Basic ' + unPassEncoded,
	  			'VendorID': '1',
	  			'EHDUserId': 'terry',
	  			'ApplicationKey': 'b6956ad2-ca01-45e6-ab57-4b51b99e70df'
	  		},
	  		data: {
	  			'Value': patientId.toString(),
	  			'Type': 'MRN'
	  		}
	  	}).success(function(arg1, arg2) {
	  		console.log('success arg1: '+arg1);
	  		console.log('success arg2: '+arg2);
	  	}).error(function(arg1, arg2) {
	  		console.log('error arg1: '+arg1);
	  		console.log('error arg2: '+arg2);
	  	});
  	};

  	getPatientDemoInfo(3230000);
  }])
  .controller('MyCtrl2', [function() {

  }]);
