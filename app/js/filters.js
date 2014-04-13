'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('numTargetDoses', function() {
    return function(targetDoses){
      var targetDoses = targetDoses || '';

      if(targetDoses.length === 1) return targetDoses[0];
      
      return targetDoses[0] + '-' + targetDoses[1];
    };
  })
  ;