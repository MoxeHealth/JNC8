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

.value('patientId', 323000)

.value('orgId', 3)

.config(['$routeProvider', function($routeProvider) {
  console.log('config called');

  $routeProvider.when('/moxe', {
    templateUrl: 'partials/dataViz.html',
    resolve: {
      setUpApp: function(startup){
        // setUpApp isn't passed into the controller because the pt factory is updated with side effects
        console.log("setUpApp");
        return startup.initializeMoxe();
      }
    },
    controller: 'dataEntryCtrl'
  });

  $routeProvider.when('/returning', {
    templateUrl: 'partials/dataEntry.html',
    resolve: {
      setUpApp: function(startup) {
        // setUpApp isn't passed into the controller because the pt factory is updated with side effects
        console.log("Set up app for returning user.");
        return startup.initializeReturning();
      }
    },
    controller: 'dataEntryCtrl'
  })

  $routeProvider.when('/dataViz', {
    templateUrl: 'partials/dataViz.html',
    controller: 'dataVizCtrl'
  });

  $routeProvider.when('/', {
    templateUrl: 'partials/dataEntry.html',
    controller: 'dataEntryCtrl'
  })

  $routeProvider.otherwise({
    redirectTo: '/'
  });
}])

.run(['$rootScope', 'db', 'goodRx', 'orgId', function($rootScope, db, goodRx, orgId) {
  console.log('run called');
  $rootScope.patientId = 3230000;
  $rootScope.orgId = 3;
}]);

