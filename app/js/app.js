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
        // setUpApp variable isn't passed into the dataEntry controller because the pt model properties are
        // defined by side effects of startup.initializeReturning
        console.log("Set up app for returning user.");
        return startup.initializeReturning();
      }
    },
    controller: 'dataEntryCtrl'
  })

  $routeProvider.when('/dataViz', {
    templateUrl: 'partials/dataViz.html',
    //make sure that pt factory has information needed before it is passed as a parameter 
    //to functions in dataViz which use pt, such as algorithm.methods.runAlgorithm
    resolve: {
      checkPtData: function(pt, $location){
        //if needed pt data not set, then user has accessed '/dataViz' route prior to accessing '/dataEntry' route
        if(!pt.hasNeededData){
          $location.url('/');
        }
      }
    },
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

.run(['$rootScope', 'db', 'goodRx', function($rootScope, db, goodRx) {
  $rootScope.patientId = 3230000;
  // $rootScope.orgId = 3;
}]);

