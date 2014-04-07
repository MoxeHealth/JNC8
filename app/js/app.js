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
      initializedData: function($rootScope, initializer){
          return initializer.initialize();
      }
    },
    controller: 'MainController'
  });

  $routeProvider.when('/view2', {
    templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'
  });
  $routeProvider.otherwise({
    redirectTo: '/view1'
  });
}])
.run(['$rootScope','substrate', 'db', 'initializer', function($rootScope, substrate, db, initializer) {
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
