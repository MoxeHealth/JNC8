'use strict';

/* Controllers */

angular.module('myApp.controllers', [
  ])

.controller('MainController', function($scope, initializer) {

  // console.log('substrate', substrateData);
})
.controller('dataEntryCtrl', ['$rootScope', '$q',
function($rootScope, $q) {
  console.log('dbdata: ');
  console.log('Controller loaded.');
}])

.controller('MyCtrl2', [function() {

}]);
