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
.run(['$rootScope', 'db', 'goodRx', 'orgId', function($rootScope, db, goodRx, orgId) {
  console.log('run called');
  $rootScope.patientId = 3230000;
  $rootScope.orgId = 3;

  var ptIdentifier = {
    ptId: $rootScope.patientId,
    orgId: $rootScope.orgId
  };

  //first dummy encounter, not taking any meds
  // db.addEncounter(ptIdentifier, {
  //   emails: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     systolic: '170',
  //     diastolic: '100'
  //   },
  //   targetBP: { 
  //     systolic: '150',
  //     diastolic: '90'
  //   },
  //   curMeds: {
  //   },
  //   encounterDate: new Date("February 2 2014")
  // });

  //second dummy encounter, maxed out first med
  //maxed out first med
  // db.addEncounter(ptIdentifier, {
  //   emails: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     systolic: '165',
  //     diastolic: '100'
  //   },
  //   targetBP: { 
  //     systolic: '150',
  //     diastolic: '90'
  //   },
  //   curMeds: [
  //     {medicationName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetdoseRecs: [50]}
  //   ],
  //   encounterDate: new Date("March 1 2014")
  // });

  //third dummy encounter, maxed out second med 
  // db.addEncounter(ptIdentifier, {
  //   emails: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     systolic: '157',
  //     diastolic: '95'
  //   },
  //   targetBP: { 
  //     systolic: '150',
  //     diastolic: '90'
  //   },
  //   curMeds: [
  //     {medicationName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetdoseRecs: [50]},
  //     {medicationName: 'amlodipine', dose: 20, units: 'mg', className: 'CCB', atMax: true, targetdoseRecs: [20]}
  //   ],
  //   encounterDate: new Date("March 31 2014")
  // });

  // //fourth dummy encounter, goal met; continue treatment 
  // db.addEncounter(ptIdentifier, {
  //   emails: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     systolic: '145',
  //     diastolic: '85'
  //   },
  //   targetBP: { 
  //     systolic: '150',
  //     diastolic: '90'
  //   },
  //   curMeds: [
  //     {medicationName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetdoseRecs: [50]},
  //     {medicationName: 'amlodipine', dose: 20, units: 'mg', className: 'CCB', atMax: true, targetdoseRecs: [20]},
  //     {medicationName: 'bendroflumethiazide', dose: 10, units: 'mg', className: 'Thiazide', atMax: false, targetdoseRecs: [20]}
  //   ],
  //   encounterDate: new Date("April 27 2014")
  // });

}]);

