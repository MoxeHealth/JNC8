'use strict';

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('startup', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    console.log("into startup");
    var ptData = {};

    var initialize = function(){
      console.log('Initialize called');


    //TODO - wrap following code in post request from Epic
    var ptObj = {ptId: $rootScope.patientId};

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

  //todo - refactor so that pt calls the 'startup' service only once, not 2x. Currently pt passed into both dataVizCtrl and dataEntryCtrl
  .factory('pt', ['startup', function(startup) {
    // console.log('pt factory called');
    console.log(startup);

    var isFirstVisit = function(){
      var result = startup.ptData.db.length === 0;
      console.log('isFirstVisit', result);
      return startup.ptData.db.length === 0;
    }

    return {
      race: startup.ptData.substrate.demographics.data.Race.Text,
      // age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      age: 70,
      currentBP: {
        Systolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Systolic.Value, 10),
        Diastolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Diastolic.Value, 10)
      },
      //todo - write this function
      // currentMeds: getCurrentMeds(startup.ptData.db);
      //stub for now
      // currentMeds: [{'ACEI': 'lisinopril', atMax: true}],
      // hasDiabetes: false,
      isOnMedication: true,

      //todo - is there ever a scenario in which a doctor would enter patient data into the db, but not prescribe a medication? if so, we can use isFirstVisit. Otherwise, use currentMeds.length (currently using currentMeds.length property) to determine algorithm flow. 
      isFirstVisit: isFirstVisit(),
      hasCKD: true,
      email: startup.ptData.substrate.demographics.data.EmailAddresses,
      races: ['Black or African American', 'Asian', 'Caucasian'],
      //todo - populate this variable from the database
      //targetBP will have the same data structure as currentBP
      // targetBP: startup.ptData.db[db.length - 1].targetBP;
      isAtBPGoal: function() {
        if(this.targetBP) {
          if(this.currentBP.Systolic >= this.targetBP.Systolic || this.currentBP.Diastolic >= this.targetBP.Diastolic) {
            return false;
          }
          return true;
        } else {
          throw new Error ("Patient's target BP hasn't been set.");
        }
      },
      onMedication: function() {
        if(this.currentMeds.length > 0) {
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

    //currently assuming that every encounter in the database
    //will have a value in the blood_pressure field and an encounter_date field
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

  .service('goodRx', ['$http', function($http) {
    this.getPricing = function(name, callback) {
      $http({
        url: '/goodrx/low-price',
        method: 'GET',
        params: {
          name: name
        }
      }).success(function(data, status) {
        console.log("The GoodRx API responded successfully.");
        callback(data);
      }).error(function(data, status) {
        console.warn("The goodRx API errored: ", data, status);
      })
    };
  }])
;
