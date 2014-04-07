'use strict';

/* Controllers */

angular.module('myApp.controllers', [
])
.controller('MainController', ['$scope', 'initializedData', function($scope, initializedData) {
  $scope.initializedData = initializedData;
  console.log($scope.initializedData);
}])
.controller('dataEntryCtrl', ['$rootScope', '$q',
function($rootScope, $q) {
}])
