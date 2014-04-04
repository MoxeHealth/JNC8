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
run(['$rootScope', function($rootScope) {
  $rootScope.patientId = 3230000;
  $rootScope.calculator = 'JNC8';
}]);
