'use strict';

/* Controllers */

angular.module('myApp.controllers', [
])
.controller('dataEntryCtrl', ['$scope', '$q', 'startup',
function($scope, $q, startup) {
  console.log("ptData:");
  console.log(startup.ptData);
}])
.controller('dataVizCtrl', ['$scope', function($scope) {

}]);
