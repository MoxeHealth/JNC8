'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('dataEntryCtrl', ['$rootScope', '$q', 'substrateData', 'dbData',
  function($rootScope, $q, substrateData, dbData) {
    console.log('sdata: ', substrateData);
    console.log('dbdata: ', dbData);
    console.log('Controller loaded.');
  }])

  .controller('MyCtrl2', [function() {
  }]);
