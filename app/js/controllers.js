'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
.controller('dataEntryCtrl', ['$scope', '$q','$location', 'pt',
function($scope, $q, $location, pt) {

  $scope.removeMed = function(med){
    pt.removeMed(med);
  };

  $scope.goToDataViz = function() {
    $location.path('/dataViz');
  };

  $scope.pt = pt;

  $scope.buttonsSelected = function() {
    if($scope.pt.hasCKD !== undefined && $scope.pt.isOnMedication !== undefined && $scope.pt.hasDiabetes !== undefined){
      return true;
    }
    return false;
  };

}])

.controller('dataVizCtrl', ['$scope', 'pt', 'startup', 'db', function($scope, pt, startup, db) {
  var algoResults = algorithm.methods.runAlgorithm(pt);

  $scope.recommendationMsg = algoResults.recs.recMsg;
  $scope.medRecs = algoResults.recs.medRecs;
  $scope.dbData = startup; // refactor to only expose db data and not substrate data
  $scope.targetDias = algoResults.targetBP.Diastolic;
  $scope.targetSys = algoResults.targetBP.Systolic;
  $scope.pt = pt;
  $scope.encounter = pt.encounter;

  //hard code for now
  pt.encounter.targetBP = {
    Systolic: $scope.targetSys,
    Diastolic: $scope.targetDias
  };

  console.log('in dataViz controller');
  $scope.saveToDB = function(){
    db.addEncounter(pt.ids, pt.emails, pt.encounter); 
  }
}]);

 // var ptId = db.connection.escape(req.body.ptId);
 //  var orgId = db.connection.escape(req.body.orgId) || 'NULL';
 //  var encounterDate = db.connection.escape(new Date().toISOString().slice(0, 19).replace('T', ' '));
 //  var bloodPressure = db.connection.escape(JSON.stringify(req.body.encounter.bloodPressure));
 //  var prescribedMeds = db.connection.escape(JSON.stringify(req.body.encounter.prescribedMeds));
 //  var removedMeds = db.connection.escape(JSON.stringify(req.body.encounter.removedMeds));
 //  var currentMeds = db.connection.escape(JSON.stringify(req.body.encounter.currentMeds));

 //  this.addEncounter = function(ptIdentifier, encounter, callback) {

 //      return $http({
 //        url: '/db/encounters',
 //        method: 'POST',
 //        data: {
 //          ptId: ptIdentifier.ptId,
 //          orgId: ptIdentifier.orgId,
 //          //encounter object expects two values: bloodPressure and prescribedMeds
 //          encounter: encounter
 //        }
 //      });
 //    };