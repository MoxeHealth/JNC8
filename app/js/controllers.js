'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('dataEntryCtrl', ['$rootScope', 'substrate',  function($rootScope, substrate) {
    console.log('Controller loaded.');
    substrate.getPatientData($rootScope.patientId, function(patientData) {
      console.log('Into getPD callback...')
      console.log(patientData);
    });
    // $rootScope.patientData = substrate.getPatientData($rootScope.patientId);
    // console.log($rootScope.patientData);
    // substrate.getLabs($rootScope.patientId);
    // substrate.getVitals($rootScope.patientId);
  }])

  .controller('MyCtrl2', [function() {
  }]);
