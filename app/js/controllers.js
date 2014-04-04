'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('dataEntryCtrl', ['$rootScope', 'substrate',  function($rootScope, substrate) {
    substrate.getPatientDemographics($rootScope.patientId);
    substrate.getLabs($rootScope.patientId);
    substrate.getVitals($rootScope.patientId);
  }])

  .controller('MyCtrl2', [function() {
  }]);
