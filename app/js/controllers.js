'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {
  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  $scope.pt = pt;
}])
.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'algorithm', function($scope, pt, startup, algorithm) {
  console.log(algorithm);
  $scope.recommendationMsg = algorithm.recommendation;
  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  $scope.targetDias = algorithm.targetBP.diastolic;
  $scope.targetSys = algorithm.targetBP.systolic;
  $scope.pt = pt;
  console.log('controller scope', $scope);
}]);
