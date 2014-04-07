'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('initializer', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    
    var initialize = function(){
      console.log('initialize called');

    //TODO - wrap following code in post request from Epic
      var result = $q.all([substrate.getPatientData($rootScope.patientId), db.getEncounters($rootScope.patientId)
      ]);

      return result.then(function(response) {
        // substrate.patientData = response.patientData;
        // db.patientData = response.patientData;

        var deferred = $q.defer();
        $rootScope.showSplash = false;

        console.log(response);

        deferred.resolve(response);

        deferred.reject('initializer reject'); 

        return deferred.promise;

        // return {
        //   substrateData: response.patientData
        // };
      });

      // substrate.getPatientData($rootScope.patientId, function(patientData) {
      //   console.log('Into getPD callback...');
      //   substrate.patientData = patientData;
      //   console.log(substrate.patientData);
      // });

      // db.getEncounters($rootScope.patientId, function(data) {
      //   console.log(data);
      // });
    };

    var showSplash = function(){
      return showSplash;
    }

    return {
      initialize: initialize,
      showSplash: showSplash
    };
  }])
  .factory('db', ['$http', function($http) {
    var getEncounters = function(ptId, callback) {
      console.log("ptId in getEcounters:" + ptId);
      return $http({
        url: '/db/encounters',
        method: 'GET',
        params: {
          ptId: ptId
        }
      });
    };

    var addEncounter = function(ptId, encounter, callback) {
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptId,
          //encounter object expects two values: bloodPressure and medicationsPrescribed
          encounter: encounter
        }
      });
    };

    return {
      getEncounters: getEncounters,
      addEncounter: addEncounter
    };
  }])
  .factory('substrate', ['$http', '$q', function($http, $q) {
    var apiPaths = {
      demographics: '/patient/demographics',
      vitals: '/encounter/vitals',
      labs: '/patient/labs'
    };

    var getPatientData = function(patientId, callback){
      console.log('into getPatientData');

      var result = $q.all({
        demographics: getPatientDemographics(patientId),
        vitals: getVitals(patientId),
        lab: getLabs(patientId)
      });

      return result;
      // .then(function(response) {
      //   var patientData = {
      //     demographics: response.demographics.data,
      //     vitals: response.vitals.data,
      //     lab: response.lab.data
      //   };
      //   return callback(patientData);
      // });
    };

    var getPatientDemographics = function(patientId) {
      console.log('getPatientDemographics is being run.');
      return $http({
        url: apiPaths.demographics,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    var getLabs = function(patientId) {
      console.log('getLabs is being run.');
      return $http({
        url: apiPaths.labs,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    var getVitals = function(patientId) {
      console.log('getVitals is being run.');
      return $http({
        url: apiPaths.vitals,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    return {
      getPatientData: getPatientData,
      patientData: {}
    };
  }])

  .factory('pt', ['substrate', function(substrate) {

    return {
      race: substrate.patientData.demographics.Race.Text,
      age: parseInt(substrate.patientData.demographics.Age.substring(0,substrate.patientData.demographics.Age.length-1), 10),
      bp: [parseInt(substrate.patientData.vitals.BloodPressure.Systolic.Value, 10), parseInt(substrate.patientData.vitals.BloodPressure.Diastolic.Value, 10)],
      hasDiabetes: true,
      hasCKD: true,
      onMedication: true,
      medications: {
       medName : {
         dose: 10,
         maxDose: 50,
         unit: 'mg'
        }
      },
      targetBP: '',
      hasBPGoal: function(){
        if(this.targetBP){
          if(this.targetBP.length > 0){
            return true;
          }
        }
        return false;
      },
      isAtBPGoal: function() {
        if(this.hasTargetBP()) {
          if(this.bp[0] >= this.targetBP[0] || this.bp[1] >= this.targetBP[1]) {
            return false;
          }
          return true;
        } else {
          throw new Error ("Patient's target BP hasn't been set.");
        }
      }
    };
  }])

  .factory('algorithmSvc', ['pt', function(pt) {
    //returns recommendation string and status
    //3 possible statuses: 'bad', 'ok', 'good'

    var recMessages = {
      continueTreatment: "Continue current treatment and monitoring.",
      firstVisit: {
        nonBlackNoCKD: "Initiate thiazide-type diuretic or ACEI or ARB or CCB, alone or in combination. ACEIs and ARBs should not be used in combination.",
        blackNoCKD: "Initiate thiazide-type diuretic or CCB, alone or in combination.",
        CKD: "Initiate ACEI or ARB, alone or in combination with other drug class. ACEIs and ARBs should not be used in combination."
      },
      titrationStrategies: {
        a: "Maximize first medication before adding second.",
        b: "Add second medication before reaching maximum dose of first medication.",
        c: "Start with two medication classes, separately or as fixed-dose combination."
      },
      allFollowUpVisits: "Reinforce medication and lifestyle adherence.",
      secondVisit: {
        ab: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
        c: "Titrate doses of initial medication to maximum."
      },
      thirdVisit: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
      fourthVisit: "Add additional medication class(eg, &#914;-blocker, aldosterone antagonist, or others) and/or refer to physician with expertise in hypertension management."
    };

    var recommendation = {
      status: '',
      message: ''
    };

    if(pt.hasBPGoal()){
      if(pt.isAtBPGoal()){
          // meeting goal -- move to data viz to reinforce success and show BP graphs
        return {};
      } else { // not at BP goals

      }
    } else {
      if(pt.age >= 18) {
        // set targetBP by age and diabetes/CKD logic
        if(!pt.hasDiabetes && !pt.hasCKD) {
          if(pt.age >= 60) {
            pt.targetBP = [150, 90];
          } else if (pt.age < 60) {
            pt.targetBP = [140, 90];
          }
        } else if(pt.hasDiabetes || pt.hasCKD) {
          if(pt.hasDiabetes && !pt.hasCKD) {
            pt.targetBP = [140, 90];
          } else if (pt.hasCKD) {
            pt.targetBP = [140, 90];
          }
        }
      } else {
        // TODO: Patient is under 18.
        console.warn("Patient is under 18.");
      }

      if(pt.isAtBPGoal()) {
        recommendation.message = recMessages.continueTreatment;
        return recommendation;
      }

      if(!pt.hasCKD) {
        if(pt.race !== "Black or African American") {
          // TODO: pt.selectDrugTreatmentStrategy();
          recommendation.message = recMessages.firstVisit.nonBlackNoCKD;
          return recommendation;
        } else if(pt.race === "Black or African American") {
          recommendation.message = recMessages.firstVisit.blackNoCKD;
          return recommendation;
        }
      } else if(pt.hasCKD) {
        recommendation.message = recMessages.firstVisit.CKD;
        return recommendation;
      }
    }

    // collect additional information where needed

    console.warn("Reached the bottom of the algorithm logic; this shouldn't happen.");
  }])
  ;
