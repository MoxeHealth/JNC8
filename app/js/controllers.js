'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', '$compile','pt', 'orgId',
function($scope, $q, $location, $compile, pt, orgId, drugInput) {

  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  //visitors to stand alone website will not have an ordId 
  //todo- why not orgId.orgId?????
  $scope.standAlone = orgId ? false : true;
  // $scope.standAlone = true;

  $scope.pt = pt;

  console.log('pt ', pt);

  // $scope.addDrugField = function(){
  //   var newDrugField = $compile('<tr drugInput></tr>')
  //   angular.element('tbody').append('<tr><td>Thing</td></tr>')
  // };
  $scope.possibleMeds = [
    'ACEI',
    'ARB',
    'CCB',
    'Thiazide'
  ];

  $scope.buttonsSelected = function() {
    if($scope.pt.hasCKD !== undefined && $scope.pt.isOnMedication !== undefined && $scope.pt.hasDiabetes !== undefined){
      return true;
    }
    return false;
  };

}])

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'db', 'orgId', function($scope, pt, startup, db, orgId) {
  $scope.saveToDB = function(){
    $scope.clicked = true;
    // console.log('saveToDB');
    // db.addEncounter(pt.ids, pt.encounter); 
  };

  //only want to save targetBP and date
  $scope.saveTargetToDB = function(){
    $scope.clicked = true;
    // pt.encounter = {
    //   targetBP: {
    //     systolic: $scope.targetSys,
    //     diastolic: $scope.targetDias
    //   },
    //   encounterDate: pt.encounter.encounterDate
    // }
    // db.addEncounter(pt.ids, pt.encounter); 
  }

  var algoResults = algorithm.methods.runAlgorithm(pt);

  $scope.pt = pt;
  $scope.standAlone = orgId ? false : true;
  $scope.recommendationMsg = algoResults.recs.recMsg;
  $scope.recs = algoResults.recs;
  $scope.medRecs = algoResults.recs.medRecs;
  $scope.showMeds = $scope.recs.medRecs.length ? true : false;

  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  console.log(parseInt(pt.isOnMedication));

  // if(typeof pt.isOnMedication === 'string') {
  //   $scope.ptOnMeds = parseInt(pt.isOnMedication) ? true : false;
  // } else {
  //   $scope.ptOnMeds = pt.isOnMedication;
  // }

  $scope.ptOnMeds = pt.curMeds.length ? true : false;

}]);
