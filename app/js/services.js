'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')
  .factory('substrate', ['$http', function($http) {
    var baseUrl = 'http://substratestaging.moxehealth.com/api/2013-1/get/patient/';
    var apiPaths = {
      demographics: 'demographics',
      vitals: 'vitals',
      labs: 'labs'
    };

    return {
      getPatientDemographics: function(patientId) {
        console.log('getPatientDemographics is being run.');
        $http({
          url: '/demographics',
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(arg1, arg2) {
          console.log('success arg1: '+arg1);
          console.log('success arg2: '+arg2);
        }).error(function(arg1, arg2) {
          console.log('error arg1: '+arg1);
          console.log('error arg2: '+arg2);
        });
      },
      getLabs: function(patientId) {
        console.log('getLabs is being run.');
        $http({
          url: baseUrl + apiPaths.labs,
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(arg1, arg2) {
          console.log('success arg1: '+arg1);
          console.log('success arg2: '+arg2);
        }).error(function(arg1, arg2) {
          console.log('error arg1: '+arg1);
          console.log('error arg2: '+arg2);
        });
      },
      getVitals: function(patientId) {
        console.log('getVitals is being run.');
        $http({
          url: baseUrl + apiPaths.vitals,
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(arg1, arg2) {
          console.log('success arg1: '+arg1);
          console.log('success arg2: '+arg2);
        }).error(function(arg1, arg2) {
          console.log('error arg1: '+arg1);
          console.log('error arg2: '+arg2);
        });
      }
    };
  }])
  ;
