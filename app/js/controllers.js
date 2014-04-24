'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$rootScope', '$scope', '$q','$location', '$compile','pt', 'ptHelpers',
function($rootScope, $scope, $q, $location, $compile, pt, ptHelpers) {
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

  $scope.addDrugInput = function(){
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

  $scope.saveToDBCalled = false;

  $scope.saveToDB = function(){

    //add meds that were clicked
    if($scope.medRecs){
      for(var i = 0; i < $scope.medRecs.length; i++){
        for(var k = 0; k < $scope.medRecs[i].meds.length; k++){
          var med = $scope.medRecs[i].meds[k];
          if(med.addMed){
            //don't want extra information on med object
            //addMed only needed until med is added to pt.curMeds 
            delete med['addMed'];
            pt.curMeds.push(med);
          }
        }
      }
    }
    //remove any meds that were removed 
    for (var i = 0; i < pt.curMeds.length; i++) {
        if(pt.curMeds[i].removeMed){
          pt.curMeds.splice(i, 1);
        }
    }

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
    db.addEncounter(pt.ids, encounter, function(data){
      console.log(data);
    }); 
    $scope.saveToDBCalled = true;
  };

  var algoResults = algorithm.methods.runAlgorithm(pt);

  $scope.pt = pt;
  $scope.recommendationMsg = algoResults.recs.recMsg;
  $scope.recs = algoResults.recs;
  $scope.medRecs = algoResults.recs.medRecs;
  $scope.showMeds = $scope.recs.medRecs.length ? true : false;

  //display div containing patient's current medications 
  $scope.ptOnMeds = pt.curMeds.length ? true : false;

}]);
