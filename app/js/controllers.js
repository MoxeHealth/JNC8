'use strict';

/* Controllers */

angular.module('myApp.controllers', [
  'n3-charts.linechart'
])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {

  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  console.log('ptData:');
  $scope.pt = pt;


}])
.controller('dataVizCtrl', ['$scope', 'pt', 'graphData', function($scope, pt, graphData) {

  $scope.pt = pt;
  $scope.data = graphData;

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
          console.log('tooltip ',date);
          return date;
        }
      },
      y: {type: 'linear'},
      y2: {type: 'linear'},
      y3: {type: 'linear'},
      y4: {type: 'linear'}
    },
    series: [
      {y: 'systolic', color: '#DBE2FF', thickness: '3px', label: 'Patient Systolic'},
      {y: 'diastolic', color: '#872E44', thickness: '3px', label: 'Patient Diastolic'},
      {y: 'targetDias', color: '#EBB9C6', thickness: '1px', label: 'Target Diastolic'},
      {y: 'targetSys', axis: 'y2',  thickness: '1px', color: '#2E4087', label: 'Target Systolic'}
    ],
    lineMode: 'linear',
    tension: 0.7
  };

}]);
