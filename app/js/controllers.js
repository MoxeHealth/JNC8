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
  var algoResults = algorithm(pt);
  console.log('algorithm', algoResults);
  console.log('algorithm meds', algoResults.medRecs);

  $scope.recommendationMsg = algoResults.recMsg;
  $scope.medRecs = algoResults.medRecs;
  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  $scope.targetDias = algoResults.targetBP.diastolic;
  $scope.targetSys = algoResults.targetBP.systolic;
  $scope.pt = pt;

}]);

