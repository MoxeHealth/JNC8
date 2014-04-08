'use strict';

/* Controllers */

angular.module('myApp.controllers', [
])
.controller('dataEntryCtrl', ['$scope', '$q', 'pt',
function($scope, $q, pt) {
  console.log('ptData:');
  $scope.pt = pt;
  // $scope.$watch(pt, function(newPt, oldPt) {
  //   console.log('newPt', newPt);
  //   console.log('oldPt', oldPt);
  //   $scope.pt = newPt;
  // });

}])
.controller('dataVizCtrl', ['$scope', function($scope) {

}]);
