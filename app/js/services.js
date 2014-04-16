'use strict';

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('orgId', ['$rootScope', function($rootScope){
    return {
      orgId: $rootScope.orgId
    }
  }])

  // .factory('orgId', ['$rootScope', function(orgId, $rootScope){
  //   return $rootScope.orgId;
  // }])

  .service('startup', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    console.log("into startup");
    var ptData = {};
    //TODO - wrap following code in post request from Epic
    var ptIdentifier = {ptId: $rootScope.patientId, orgId: $rootScope.orgId};

    var initialize = function(){
      console.log('Initialize called');

    var result = $q.all([substrate.getPatientData($rootScope.patientId), db.getEncounters(ptIdentifier)
    ]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];
        ptData.db = response[1];

        console.log('substrate', ptData.substrate);
        console.log('db', ptData.db);
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

      var result = $http({
        url: '/db/encounters',
        method: 'GET',
        params: {
          ptId: ptIdentifier.ptId,
          orgId: ptIdentifier.orgId
        }
      });

      return result.then(function(response){
        return response.data;
      });
    };

    this.addEncounter = function(ptIdentifier, encounter, callback) {

      console.log('addEncounter called');
      console.log('ptEncounter', encounter);
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptIdentifier.ptId,
          orgId: ptIdentifier.orgId,
          //encounter object expects multiple values: bloodPressure, currentMeds, targetBP
          encounter: encounter
        }
      });
    };
  }])

  .factory('substrate', ['$http', '$q', function($http, $q) {
    var apiPaths = {
      demographics: '/patient/demographics',
      vitals: '/encounter/vitals',
      labs: '/patient/labs',
      medications: '/patient/medications',
      problems: '/patient/problems'
    };

    var getPatientData = function(patientId, callback){
      console.log('into getPatientData');

      var result = $q.all({
        // problems: getProblems(patientId),
        // medications: getMedications(patientId),
        problems: getSubstrateData('problems', patientId),
        medications: getSubstrateData('medications', patientId),
        demographics: getSubstrateData('demographics', patientId),
        vitals: getSubstrateData('vitals', patientId),
        labs: getSubstrateData('labs', patientId)
      });
      return result.then(function(response) {
        var substrateData = {};

        for (var service in response){
          substrateData[service] = response[service].data;
        }
        return substrateData;
      });
    };

    var getSubstrateData = function(type, patientId, justCurrentMeds){
      console.log('getting ' + type + ' data');

    //medications and problems endpoints have slightly different request format
      if(type === 'medications'){
        var justCurrentMeds = justCurrentMeds || 'true';
        var data = {
          'PatientId': {
            'Value': patientId,
            'Type': 'MRN'
          },
          'IncludeCurrentMedicationsOnly': justCurrentMeds
        };
      }else if(type === 'problems'){
        var data = {
          'PatientId': {
            'Value': patientId,
            'Type': 'MRN'
          }
        }
      }else{
        data = {
          'Value': patientId,
          'Type': 'MRN'
        }
      }
      return $http({
        url: apiPaths[type],
        method: 'POST',
        data: data
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

    //todo- stub for now, waiting on currentMeds service to be added to Moxe

    //'pt' properties defined (or assigned null value) in this function:
    
      //from substrate or database if data exists: age, race, hasDiabetes, hasCKD, onMedication, 
      //most recent encounter object with current medications, current blood pressure, encounter date
      //from database if data exists: target blood pressure

    var pt = {};

    //get encounter from moxe user 
    var getProblems = function(problemsArray){
      var problems = {};

      for(var i = 0; i < problemsArray.length; i++){
        problems[problemsArray[i].ProblemName] = true;
      }
      console.log('problems', problems);
      return problems;
    }

    //searching for string "Chronic kidney disease"
    var problemListContainsCKD = function(problems){
      for(var problem in problems){
        var name = problem.split(' ').slice(0,3).join(' ');
        if(name === 'Chronic kidney disease'){
          return true;
        }
      }
      return false;
    };

    //searching for string "Diabetes mellitus"
    var problemListContainsDiabetes = function(problems){
      for(var problem in problems){
        var name = problem.split(' ').slice(0,2).join(' ');
        if(name === 'Diabetes mellitus'){
          return true;
        }
      }
      return false;
    };

    //todo- where to get information on race choices available for standalone app? 

    pt.races =  ['Black or African American', 'Asian', 'Caucasian'];

    if(startup.ptData.substrate){
      var problems = getProblems(startup.ptData.substrate.problems);

      var vitalsBP = startup.ptData.substrate.vitals.BloodPressure;

      //currently only one BP reading in vitals. Soon Moxe vitals service will return an array of BP readings
      var bloodPressure = {
        Systolic: parseInt(vitalsBP.Systolic.Value, 10) || null,
        Diastolic: parseInt(vitalsBP.Diastolic.Value, 10) || null
      };

      var encounterDbData = startup.ptData.db[startup.ptData.db.length - 1] || null;
      var encounter = {
        encounterDate: encounterDbData.encounter_date || null,
        bloodPressure: encounterDbData.blood_pressure || bloodPressure ||null,
        // targetBP: startup.ptData.db[db.length - 1].targetBP;
        targetBP: encounterDbData.target_bp || null,
        currentMeds: encounterDbData.current_meds || null
      };
      //'ids' needed to save information from session to the database 
      pt.ids = startup.ptIdentifier;
      pt.emails = startup.ptData.substrate.demographics.EmailAddresses;
      pt.encounter = encounter;

      //todo - populate this variable from the database
      // targetBP: startup.ptData.db[db.length - 1].targetBP;

      pt.race = startup.ptData.substrate.demographics.Race.Text || null;
      //age is a string ending in "y"
      pt.age = parseInt(startup.ptData.substrate.demographics.Age.substring(0,startup.ptData.substrate.demographics.Age.length-1), 10) || null;
      pt.hasCKD = problemListContainsCKD(problems);
      pt.hasDiabetes = problemListContainsDiabetes(problems);
      pt.isOnMedication = false;
    }

    //get encounter from new or current user of standalone app

    if(startup.ptData.substrate){
      var encounterDbData = startup.ptData.db[startup.ptData.db.length - 1] || null;

      var encounter = {
        emails: encounterDbData.emails[0] || null,
        encounterDate: encounterDbData.encounter_date || null,
        bloodPressure: encounterDbData.blood_pressure || null,
        targetBP: encounterDbData.target_bp || null,
        currentMeds: encounterDbData.current_meds || null
      };
    }

    return pt;
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
