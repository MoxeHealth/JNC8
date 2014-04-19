'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', '$compile','pt', 'orgId',
function($scope, $q, $location, $compile, pt, orgId, drugInput) {
  //visitors to stand alone website will not have an ordId 
  //todo- why not orgId.orgId?????
  $rootScope.showSplash = false;
  $scope.standAlone = orgId ? false : true;
  // $scope.standAlone = true;

  $scope.goToDataViz = function() {
    //moxe user already has curBP stored in substrate database 
    if($scope.standAlone){
      pt.bps.push(pt.curBP);
    }
    $location.path('/dataViz');
  };

  //visitors to stand alone website will not have an ordId 
  //todo- why not orgId.orgId?????
  // $scope.standAlone = orgId ? false : true;
  // $scope.standAlone = true;
  $scope.pt = pt;
  console.log($scope);

  $scope.addDrugInput = function(){
    console.log("Adding drug field...");
    pt.curMeds.push({});
  };

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
    console.log('saveToDB');
    if($scope.standAlone){
      var encounter = pt;
    }else{
      //other pt information is already saved in moxe substrate,
      //and moxe substrate should be single source of truth for 
      //as much information as possible 
      var encounter = {
        curTargetBP: pt.curTargetBP ,
        encounterDate: pt.curDate
      }
    }
    db.addEncounter(pt.ids, encounter); 
  };

  var algoResults = algorithm.methods.runAlgorithm(pt);

  $scope.pt = pt;
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
