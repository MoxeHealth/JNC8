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

  // var ptObj = {
  //   ptId: $rootScope.patientId
  // }

  // db.addEncounter(ptObj, {
  //   bloodPressure: {systolic: 135, diastolic: 85},
  //   medicationsPrescribed: {thiazine: 'thiazine', vitaminc: 'vitaminc'}
  // });

}]);
