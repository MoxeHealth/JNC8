'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {
  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  $scope.pt = pt;

  $scope.liClick = function(){
    console.log('li click');
  };

  $scope.spanClick = function(){
    console.log('span click');
  };
  
  $scope.buttonsSelected = function() {
    if($scope.pt.hasCKD && $scope.pt.isOnMedication && $scope.pt.hasDiabetes){
      return true;
    }
    return false;
  };
}])

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'algorithm', function($scope, pt, startup, algorithm) {

  //placeholder for now, in the future will be received from algorithm:
  //$scope.medRecs = algorithm.medRecs;
  $scope.medRecs = [{'medClass': 'ACE', 'meds': ['benazeprirl', 'captopril']}, {'medClass': 'ARB', 'meds': ['xanax', 'prozac']}];

  $scope.recommendationMsg = algorithm.recommendation;

  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  console.log(startup);
  $scope.targetDias = algorithm.targetBP.diastolic;
  $scope.targetSys = algorithm.targetBP.systolic;
  $scope.pt = pt;
}]);

