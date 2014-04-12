'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])
.config(['$routeProvider', function($routeProvider) {
  console.log('config called');

  $routeProvider.when('/', {
    templateUrl: 'partials/dataEntry.html',
    resolve: {
      setUpApp: function(startup){
        console.log("setUpApp");
        return startup.initialize();
      }
    },
    controller: 'dataEntryCtrl'
  });

  $routeProvider.when('/dataViz', {
    templateUrl: 'partials/dataViz.html',
    controller: 'dataVizCtrl'
  });
  $routeProvider.otherwise({
    redirectTo: '/'
  });
}])
.run(['$rootScope', 'db', 'goodRx', function($rootScope, db, goodRx) {
  console.log('run called');
  $rootScope.patientId = 3230000;
  $rootScope.orgId = 3;
  $rootScope.calculator = 'JNC8';
  goodRx.getPricing('lipitor');

  var obj = {
    ptId: $rootScope.patientId
  };
  db.addEncounter(obj, {
    bloodPressure: {systolic: 130, diastolic: 68},
    medicationsPrescribed: {thiazine: 'thiazine', vitaminc: 'vitaminc'}
  });
}]);
