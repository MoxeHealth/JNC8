'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')
  .factory('substrate', ['$http', function($http) {
    var apiPaths = {
      demographics: '/patient/demographics',
      vitals: '/encounter/vitals',
      labs: '/patient/labs'
    };

    return {
      getPatientDemographics: function(patientId) {
        console.log('getPatientDemographics is being run.');
        $http({
          url: apiPaths.demographics,
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(data, status, headers, config) {
          console.log('GetPatientDemographics success.');
          console.dir(data);
        }).error(function(data, status, headers, config) {
          console.log('GetPatientDemographics error.');
        });
      },

      getLabs: function(patientId) {
        console.log('getLabs is being run.');
        $http({
          url: apiPaths.labs,
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(data, status, headers, config) {
          console.log('GetLabs success.');
          console.dir(data);
        }).error(function(data, status, headers, config) {
          console.log('GetLabs error.');
        });
      },

      getVitals: function(patientId) {
        console.log('getVitals is being run.');
        $http({
          url: apiPaths.vitals,
          method: 'POST',
          data: {
            'Value': patientId,
            'Type': 'MRN'
          }
        }).success(function(data, status, headers, config) {
          console.log('GetVitals success.');
          console.dir(data);
        }).error(function(data, status, headers, config) {
          console.log('GetVitals error.');
        });
      }
    };
  }])
  .factory('algorithmSvc', ['substrate', function(substrate) {
    substrate.getPatientData($rootScope.patientId).success(function() {

    });
  }])
  ;
