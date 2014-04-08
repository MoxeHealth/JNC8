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
        return startup.initialize();
      }
    },
    controller: 'dataEntryCtrl'
  });

  $routeProvider.when('/dataViz', {
    templateUrl: 'partials/dataViz.html', controller: 'dataVizCtrl'
  });
  $routeProvider.otherwise({
    redirectTo: '/'
  });
}])
.run(['$rootScope','substrate', 'db', 'startup', function($rootScope, substrate, db, startup) {
  console.log('run called');
  $rootScope.patientId = 3230000;
  $rootScope.calculator = 'JNC8';

  // db.addEncounter($rootScope.patientId, {
  //   bloodPressure: {systolic: 120, diastolic: 60},
  //   medicationsPrescribed: {thiazine: 'thiazine', vitaminc: 'vitaminc'}
  // },
  // function(data, status){
  // });
  // algorithmSvc($rootScope.patientData, 'JNC8');
}]);
