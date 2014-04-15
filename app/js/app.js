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

  // // //first dummy encounter, not taking any meds
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '170',
  //     Diastolic: '100'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: {
  //   },
  //   encounterDate: new Date("February 2 2014")
  // });

  // // //second dummy encounter, maxed out first med
  // // //maxed out first med
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '165',
  //     Diastolic: '100'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: [
  //     {medName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetDoseRecs: [50]}
  //   ],
  //   encounterDate: new Date("March 1 2014")
  // });

  // // //third dummy encounter, maxed out second med 
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '157',
  //     Diastolic: '95'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: [
  //     {medName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetDoseRecs: [50]},
  //     {medName: 'amlodipine', dose: 20, units: 'mg', className: 'CCB', atMax: true, targetDoseRecs: [20]}
  //   ],
  //   encounterDate: new Date("March 31 2014")
  // });

  // // //fourth dummy encounter, goal met; continue treatment 
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '145',
  //     Diastolic: '85'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: [
  //     {medName: 'lisinopril', dose: 50, units: 'mg', className: 'ACEI', atMax: true, targetDoseRecs: [50]},
  //     {medName: 'amlodipine', dose: 20, units: 'mg', className: 'CCB', atMax: true, targetDoseRecs: [20]},
  //     {medName: 'bendroflumethiazide', dose: 10, units: 'mg', className: 'Thiazide', atMax: false, targetDoseRecs: [20]}
  //   ],
  //   encounterDate: new Date("April 27 2014")
  // });

}]);

