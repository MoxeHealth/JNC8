'use strict';

/* Controllers */

angular.module('myApp.controllers', [
  'n3-charts.linechart'
])
//sk change - delete pt
.controller('dataEntryCtrl', ['$scope', '$q','$location',
function($scope, $q, $location) {

  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  console.log('ptData:');

  //sk change- $scope.pt = pt;
  //sk addition-
  $scope.pt = {
    age: 38,
    currentBP: {
      Diastolic: 60,
      Systolic: 122
    },
    // hasCKD: true,
    hasDiabetes: true,
    isOnMedication: true,
    medication: [
      {
        dose: 10,
        maxDose: 50,
        name: "Advil",
        unit: "mg"
      },
      {
        dose: 10,
        maxDose: 40,
        name: "ACEI",
        unit: "mg"
      }
    ],
    // race: "Black or African American",
    races: [
      "Black or African American",
      "Asian",
      "Caucasian"
    ]
  };

  $scope.buttonsSelected = function() {
    if($scope.pt.hasCKD && $scope.pt.isOnMedication && $scope.pt.hasDiabetes){
      return true;
    }
    return false;
  };
}])
.controller('dataVizCtrl', ['$scope', 'pt', 'graphData', function($scope, pt, graphData) {

  $scope.pt = pt;
  $scope.data = graphData;

  console.log($scope.data);

  $scope.options = {
    axes: {
      x: {
        key: 'date',
        labelFunction: function(value) {
          console.log('value', value);
          var date =  value;
          // console.log('date=value', date);
          var datestring = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2)  + "/" + (date.getFullYear().toString()).substr(2);
          // return datestring;
          return datestring;
        },
        type: 'date',
        tooltipFormatter: function(date) {
          var datestring = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2)  + "/" + (date.getFullYear().toString()).substr(2);
          return datestring;
        }
      },
      y: {type: 'linear'},
      y2: {type: 'linear'},
      y3: {type: 'linear'},
      y4: {type: 'linear'}
    },
    series: [
      {y: 'systolic', color: '#2E4087', thickness: '3px', label: 'Patient Systolic'},
      {y: 'diastolic', color: '#872E44', thickness: '3px', label: 'Patient Diastolic'},
      {y: 'targetDias', color: '#EBB9C6', thickness: '1px', label: 'Target Diastolic'},
      {y: 'targetSys', thickness: '1px', color: '#DBE2FF', label: 'Target Systolic'}
    ],
    lineMode: 'linear',
    tension: 0.7
  };

}]);
