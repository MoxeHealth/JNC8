'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap'
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

  var ptObj = {
    ptId: $rootScope.patientId,
    orgId: $rootScope.orgId
  };

  var details = {
    email: ['ilyons@gmail.com'],
    bloodPressure: { 
      Systolic: '150',
      Diastolic: '100'
    },
    targetBP: { 
      Systolic: '1400',
      Diastolic: '90'
    },
    prescribedMeds: {
      notSure: 'entirelyUnsure'
    },
    removedMeds: {
      notSure: 'entirelyUnsure'
    },
    currentMeds: {
      notSure: 'entirelyUnsure'
    }
  };

  // db.addEncounter(ptObj, details);

}]);

