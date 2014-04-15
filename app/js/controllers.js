'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {

  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  $scope.pt = pt;

  $scope.buttonsSelected = function() {
    if($scope.pt.hasCKD !== undefined && $scope.pt.isOnMedication !== undefined && $scope.pt.hasDiabetes !== undefined){
      return true;
    }
    return false;
  };

}])

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'db', function($scope, pt, startup, db) {
  console.log(pt);
  
  var algoResults = algorithm.methods.runAlgorithm(pt);
  $scope.recommendationMsg = algoResults.recs.recMsg;
  $scope.recs = algoResults.recs;
  $scope.showMeds = $scope.recs.medRecs.length ? true : false;

  $scope.medRecs = algoResults.recs.medRecs;
  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  $scope.targetDias = algoResults.targetBP.Diastolic;
  $scope.targetSys = algoResults.targetBP.Systolic;
  $scope.pt = pt;
  $scope.encounter = pt.encounter;
  console.log(parseInt(pt.isOnMedication));

  if(typeof pt.isOnMedication === 'string') {
    $scope.ptOnMeds = parseInt(pt.isOnMedication) ? true : false;
  } else {
    $scope.ptOnMeds = pt.isOnMedication;
  }

  //hard code for now
  pt.encounter.targetBP = {
    Systolic: $scope.targetSys,
    Diastolic: $scope.targetDias
  };

  $scope.saveToDB = function(){
    db.addEncounter(pt.ids, pt.emails, pt.encounter); 
  }
}]);