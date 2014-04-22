'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$rootScope', '$scope', '$q','$location', '$compile','pt', 'ptHelpers',
function($rootScope, $scope, $q, $location, $compile, pt, ptHelpers) {
  console.log('dataEntry');
  $rootScope.showSplash = false;

  //don't move on to dataViz until necessary patient attributes are defined
  $scope.$watchCollection('pt', function() {
    pt.hasNeededData = ptHelpers.checkPtData(pt);
  });

  //visitors to stand alone website will not have an ordId 
  $scope.standAlone = pt.ids.orgId ? false : true;

  $scope.goToDataViz = function() {
    //moxe user already has curBP stored in substrate database 
    if($scope.standAlone){
      pt.bps.push(pt.curBP);
    }

    //set ptId using email field 
    if($scope.standAlone){
      pt.ids.ptId = pt.emails[0];
    }

    //clear the meds in the meds array if they're empty
    // if(pt.curMeds) {
    //   for(var i = 0; i < pt.curMeds.length; i++) {
    //     var med = pt.curMeds[i];
    //     if(!med.medicationName || !med.dose) {
    //       pt.curMeds[i] = undefined;
    //     }
    //   }
    // }

    $location.path('/dataViz');
  };

  $scope.pt = pt;
  console.log('scope', $scope);

  $scope.addDrugInput = function(){
    console.log("Adding drug field...");
    pt.curMeds.push({
      //in case user doesn't click 'at max dose' checkbox
      atMax: false
    });
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

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'db', function($scope, pt, startup, db) {

  //visitors to stand alone website will not have an ordId 
  $scope.standAlone = pt.ids.orgId ? false : true;

  console.log('scope', $scope);
  console.log('pt', pt);
  console.log('medRecs b4', $scope.medRecs);

  $scope.saveToDB = function(){

    //add meds that were clicked

    console.log('medRecs', $scope.medRecs);
    for(var i = 0; i < $scope.medRecs.length; i++){
      for(var k = 0; k < $scope.medRecs[i].meds.length; k++){
        var med = $scope.medRecs[i].meds[k];
        console.log('med', med);
        if(med.addMed){
          //don't want extra information on med object
          //addMed only needed until med is added to pt.curMeds 
          delete med['addMed'];
          pt.curMeds.push(med);
          console.log('ptcurMeds', pt.curMeds);
        }
      }
    }
    
    $scope.clicked = true;
    console.log('saveToDB');
    if($scope.standAlone){
      var encounter = pt;
    } else {
      //other pt information is already saved in moxe substrate,
      //and moxe substrate should be single source of truth for 
      //as much information as possible 
      var encounter = {
        curTargetBP: pt.curTargetBP,
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
