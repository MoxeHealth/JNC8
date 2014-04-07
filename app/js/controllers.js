'use strict';

/* Controllers */

angular.module('myApp.controllers', [
])
.controller('MainController', ['$scope', 'initializedData', function($scope, initializedData) {
  // console.log($scope.initializedData);
}])
.controller('dataEntryCtrl', ['$scope', '$q', 'initializedData',
function($scope, $q, initializedData) {
  $scope.initializedData = initializedData;
  console.log($scope.initializedData);
}]);
