/* global d3 */
'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('startup', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    console.log("into startup");
    var ptData = {};

    var initialize = function(){
      console.log('Initialize called');


    //TODO - wrap following code in post request from Epic
    var ptObj = {ptId: $rootScope.patientId};
    console.log("Searching for", ptObj);

    var result = $q.all([substrate.getPatientData($rootScope.patientId), db.getEncounters(ptObj)
    ]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];

        ptData.db = response[1].data;
      });
    };

    return {
      initialize: initialize,
      ptData: ptData
    };
  }])

  .service('db', ['$http', function($http) {

    this.getEncounters = function(ptObj, callback) {
      // ptObj should be an object in the form {ptId: number[, orgId: orgIdentifier]}



      return $http({
        url: '/db/encounters',
        method: 'GET',
        params: {
          ptId: ptObj.ptId,
          orgId: ptObj.orgId
        }
      });
    };

    this.addEncounter = function(ptObj, encounter, callback) {
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptObj.ptId,
          orgId: ptObj.orgId,
          //encounter object expects two values: bloodPressure and medicationsPrescribed
          encounter: encounter
        }
      });
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

  .factory('pt', ['startup', function(startup) {
    console.log('pt factory called');
    console.log(startup);

    return {
      race: startup.ptData.substrate.demographics.data.Race.Text,
      age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      currentBP: {
        Systolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Systolic.Value, 10),
        Diastolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Diastolic.Value, 10)
      },
      hasDiabetes: true,
      isOnMedication: true,
      hasCKD: true,
      medication: [{
        name: 'Advil',
        dose: 10,
        maxDose: 50,
        unit: 'mg'
      }],
      targetBP: '',
      races: ['Black or African American', 'Asian', 'Caucasian'],
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
      },
      onMedication: function() {
        if(this.medication.length > 0) {
          return true;
        }
        return false;
      }
    };
  }])

  .service('graphHelpers', [function() {

    this.getBPExtreme = function(array, keyName) {
      var numArray = [];

      for(var i = 0; i < array.length; i++) {
        numArray.push(array[i].blood_pressure[keyName]);
      }

      if(keyName === 'systolic') {
        return Math.max.apply(Math, numArray);
      } else if (keyName === 'diastolic') {
        return Math.min.apply(Math, numArray);
      } else {
        throw new Error("getBPExtreme requires either 'systolic' or 'diastolic' as a key name.");
      }
    };

    this.parseBPData = function(bpDataArr, targetBP) {
      var results = [];
      var targetSys = 120;
      var targetDias = 80;

      for(var i = 0; i < bpDataArr.length; i++) {
        var bp = JSON.parse(bpDataArr[i].blood_pressure);
        var date = new Date(bpDataArr[i].encounter_date);

        results.push({
          date: date,
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          targetDias: targetDias,
          targetSys: targetSys
        });
      }
      return results;
    };

    this.parseArray = function(array) {
      var results = [];
      for(var i = 0; i < array.length; i++) {
        var obj = array[i];
        for(var key in obj) {
          if(typeof obj[key] === "string") {
            try{
              obj[key] = JSON.parse(obj[key]);
            }
            catch (e) {
              obj[key] = new Date(obj[key]);
            }
          }
        }
        results.push(array[i]);
      }
      return results;
    };
  }])

  .factory('algorithm', ['pt', function(pt) {
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

    //for the moment, return a stub object:
    return {
      targetBP: {
        systolic: 120,
        diastolic: 80
      },
      recommendation: recMessages.firstVisit.blackNoCKD
    };

    var recommendation = {
      status: '',
      message: ''
    };

    var generateRec = function() {
      if(pt.hasBPGoal()){
        if(pt.isAtBPGoal()){
            // meeting goal -- move to data viz to reinforce success and show BP graphs
          return {};
        } else { // not at BP goals
          console.log("Not at BP goals.");
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
    };

    // collect additional information where needed

    console.warn("Reached the bottom of the algorithm logic; this shouldn't happen.");
  }])

  .service('goodRx', ['$http', function($http) {
    this.getPricing = function(name) {
      $http({
        url: '/goodrx/low-price',
        method: 'GET',
        params: {
          name: name
        }
      }).success(function(data, status) {
        console.log("The goodRx api responded successfully.");
        console.log("GoodRx response: ", data);
      }).error(function(data, status) {
        console.warn("The goodRx API errored: ", data, status);
      })
    };
  }])
  ;
