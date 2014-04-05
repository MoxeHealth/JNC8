'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dataEntry', {templateUrl: 'partials/dataEntry.html', controller: 'dataEntryCtrl'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]).
run(['$rootScope','substrate', 'db', function($rootScope, substrate, db) {
  $rootScope.patientId = 3230000;
  $rootScope.calculator = 'JNC8';

  substrate.getPatientData($rootScope.patientId, function(patientData) {
    console.log('Into getPD callback...');
    substrate.patientData = patientData;
    console.log(substrate.patientData);
  });

  db.getEncounters($rootScope.patientId, function(data) {
    console.log(data);
  });
  // db.addEncounter($rootScope.patientId, {
  //   bloodPressure: {systolic: 120, diastolic: 60},
  //   medicationsPrescribed: {thiazine: 'thiazine', vitaminc: 'vitaminc'}
  // },
  // function(data, status){
  // });
  // algorithmSvc($rootScope.patientData, 'JNC8');
}]);
