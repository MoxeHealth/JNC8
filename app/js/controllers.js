'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['substrate', function(substrate) {
    substrate.getPatientDemographics(3230000);
    // substrate.getVitals(3230000);
    // substrate.getLabs(3230000);
  }])
  .controller('MyCtrl2', [function() {

  }]);
