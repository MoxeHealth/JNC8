'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {
  //run the algorithm on the current patient data 
  
  console.log('pt', pt);

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
    console.log('hasCKD', $scope.pt.hasCKD);
    console.log('isOnMedication', $scope.pt.isOnMedication);
    console.log('hasDiabetes', $scope.pt.hasDiabetes);
    if($scope.pt.hasCKD !== undefined && $scope.pt.isOnMedication !== undefined && $scope.pt.hasDiabetes !== undefined){
      return true;
    }
    console.log('false')
    return false;
  };

}])

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', function($scope, pt, startup) {
  var algoResults = algorithm.methods.runAlgorithm(pt);
  console.log('algoResults', algoResults);
  console.log('algorithm meds', algoResults.medRecs);

  $scope.recommendationMsg = algoResults.recs.recMsg;
  $scope.medRecs = algoResults.recs.medRecs;
  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  console.log($scope.dbData);
  $scope.targetDias = algoResults.targetBP.Diastolic;
  $scope.targetSys = algoResults.targetBP.Systolic;
  $scope.pt = pt;
}]);

