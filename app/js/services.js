'use strict';

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('startup', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    console.log("into startup");
    var ptData = {};
    var ptIdentifier = {ptId: $rootScope.patientId, orgId: $rootScope.orgId};

    var initialize = function(){
      console.log('Initialize called');


    //TODO - wrap following code in post request from Epic
    var ptObj = {ptId: $rootScope.patientId, orgId: $rootScope.orgId};

    var result = $q.all([substrate.getPatientData($rootScope.patientId), db.getEncounters(ptIdentifier)
    ]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];
        ptData.db = response[1].data;
        console.log('ptData.db', ptData.db);
      });
    };

    return {
      initialize: initialize,
      ptData: ptData,
      ptIdentifier: ptIdentifier
    };
  }])

  .service('db', ['$http', function($http) {

    this.getEncounters = function(ptIdentifier, callback) {
      // ptIdentifier should be an object in the form {ptId: number[, orgId: orgIdentifier]}

      return $http({
        url: '/db/encounters',
        method: 'GET',
        params: {
          ptId: ptIdentifier.ptId,
          orgId: ptIdentifier.orgId
        }
      });
    };

    this.addEncounter = function(ptIdentifier, emails, encounter, callback) {

      console.log('addEncounter called');
      console.log('ptEncounter', encounter);
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptIdentifier.ptId,
          orgId: ptIdentifier.orgId,
          emails: emails,
          //encounter object expects two values: bloodPressure and prescribedMeds
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
        vitals: getVitals(patientId)
        // lab: getLabs(patientId) // LABS IS DOWN
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
  //purpose of pt is 1) to parse information gathered from db and substrate requests and store relevant information, 2) to share that information between the dataViz and dataEntry controllers, and 3) to update the database with newest patient information at the end of a session 
  .factory('pt', ['startup', function(startup) {
    // console.log('pt factory called');

    //need access to BP readings multiple times
    var vitalsBP = startup.ptData.substrate.vitals.data.BloodPressure;
    var currentEncounterDate = new Date().toISOString().slice(0, 19).replace('T', ' '); //vitalsBP.Systolic[vitalsBP.Systolic.length - 1].ResultDateTime.DateTime;

    //todo- stub for now, waiting on currentMeds service to be added to Moxe
    var currentBP = {
      Systolic: parseInt(vitalsBP.Systolic.Value, 10),
      Diastolic: parseInt(vitalsBP.Diastolic.Value, 10)
    };
    var encounter = {
      bloodPressure: currentBP,
      encounterDate: currentEncounterDate,
      //todo- stub for now, waiting on currentMeds service to be added to Moxe
      prescribedMeds: [
        {
          className: 'ACEI', 
          medName: 'lisinopril', 
          dose: 30,
          units: 'mg',
          atMax: false,
          date: "2013-06-18T20:47:00Z"
        }
      ],
      removedMeds: [],
      currentMeds: [
        {
          className: 'ACEI', 
          medName: 'lisinopril', 
          dose: 30,
          units: 'mg',
          atMax: true,
          targetDoseRecs: [40, 60],
          date: "2013-06-18T20:47:00Z"
        }
      ]
    };

    return {
      /////////information that will be written to database at end of session:
      //'ids' needed to save information from session to the database 
      ids: startup.ptIdentifier,
      emails: startup.ptData.substrate.demographics.data.EmailAddresses,
      encounter: encounter,
      //hard code for now to generate med recs
      currentBP: {
        Systolic: 170,
        Diastolic: 90
      },
      //currently only one BP reading in vitals. Soon Moxe vitals service will return an array of BP readings
      currentEncounterDate: currentEncounterDate,

      //todo - populate this variable from the database
      // targetBP: startup.ptData.db[db.length - 1].targetBP;

      /////////other information
      race: startup.ptData.substrate.demographics.data.Race.Text,
      // age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      age: 70,
      hasDiabetes: false,
      isOnMedication: true,

      //todo - is there ever a scenario in which a doctor would enter patient data into the db, but not prescribe a medication? if so, we can use an isFirstVisit method. Otherwise, use currentMeds.length (currently using currentMeds.length property) to determine algorithm flow. 
      hasCKD: true,
      races: ['Black or African American', 'Asian', 'Caucasian'],
      
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
    };
  }])

  .service('graphHelpers', [function() {

    this.getBPExtreme = function(array, keyName) {
      var numArray = [];

      for(var i = 0; i < array.length; i++) {
        numArray.push(array[i].blood_pressure[keyName]);
      }

      if(keyName === 'Systolic') {
        var max = Math.max.apply(Math, numArray);
        return Math.max.apply(Math, numArray);
      } else if (keyName === 'Diastolic') {
        return Math.min.apply(Math, numArray);
      } else {
        throw new Error("getBPExtreme requires either 'Systolic' or 'Diastolic' as a key name.");
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

    this.parseGraphData = function(array) {
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
    this.getPricing = function(name, dosage, callback) {
      
      var params = {};
      params.name = name;
      // if(dosage) params.dosage = dosage;

      $http({
        url: '/goodrx/low-price',
        method: 'GET',
        params: params
      }).success(function(data, status) {
        console.log("The GoodRx API responded successfully.");
        if(callback) callback(data);
      }).error(function(data, status) {
        console.warn("The goodRx API errored: ", data, status);
        if(callback) callback(data);
      })
    };
  }])
;
