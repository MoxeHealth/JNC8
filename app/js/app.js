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

  // var encounter = {
  //   bloodPressure: bloodPressure,
  //   encounterDate: currentEncounterDate,
  //   //todo- stub for now, waiting on currentMeds service to be added to Moxe
  //   prescribedMeds: [
  //     {
  //       className: 'ACEI', 
  //       medName: 'lisinopril', 
  //       dose: 30,
  //       units: 'mg',
  //       atMax: false,
  //       date: "2013-06-18T20:47:00Z"
  //     }
  //   ],
  //   removedMeds: [],
  //   currentMeds: [
  //     {
  //       className: 'ACEI', 
  //       medName: 'lisinopril', 
  //       dose: 30,
  //       units: 'mg',
  //       atMax: true,
  //       targetDoseRecs: [40, 60],
  //       date: "2013-06-18T20:47:00Z"
  //     }
  //   ]
  // };

  // //first dummy encounter, not taking any meds
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
  //   }
  // });

  // //second dummy encounter, maxed out first med
  // //maxed out first med
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '150',
  //     Diastolic: '100'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: [
  //     {className: 'ACEI', atMax: true, targetDoseRecs: [50]}
  //   ]
  // });

  // //third dummy encounter, maxed out second med 
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '150',
  //     Diastolic: '100'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: {
  //     currentMeds: [
  //       {className: 'CCB', atMax: true}, 
  //       {className: 'ACEI', atMax: true}
  //     ]
  //   }
  // });

  // //fourth dummy encounter, goal met; continue treatment 
  // db.addEncounter(ptIdentifier, {
  //   email: ['ilyons@gmail.com'],
  //   bloodPressure: { 
  //     Systolic: '150',
  //     Diastolic: '100'
  //   },
  //   targetBP: { 
  //     Systolic: '150',
  //     Diastolic: '90'
  //   },
  //   currentMeds: {
  //     currentMeds: [
  //       {className: 'CCB', atMax: true}, 
  //       {className: 'ACEI', atMax: true}
  //     ]
  //   }
  // });

}]);

