'use strict';

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('orgId', ['$rootScope', function($rootScope){
    return {
      orgId: $rootScope.orgId
    }
  }])

  .service('startup', ['$http', '$q', '$rootScope', '$location', '$route', 'substrate', 'db', function($http, $q, $rootScope, $location, $route, substrate, db) {
    
    if($location.path() === '/dataViz') {
      $location.path('/');
      $route.reload();
    } 

    var ptData = {};
    //TODO - wrap following code in post request from Epic
    var ptIdentifier = {ptId: $rootScope.patientId, orgId: $rootScope.orgId};

    var initialize = function(){
      console.log('Initialize called');

      var result = $q["all"]([substrate.getPatientData($rootScope.patientId), db.getEncounters(ptIdentifier)
    ]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];
        ptData.db = response[1].data;
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

      var result = $q.['all']({
        // problems: getProblems(patientId),
        // medications: getMedications(patientId),
        problems: getSubstrateData('problems', patientId),
        medications: getSubstrateData('medications', patientId),
        demographics: getSubstrateData('demographics', patientId),
        vitals: getSubstrateData('vitals', patientId),
        labs: getSubstrateData('labs', patientId)
      });
      return result;
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
    // var bloodPressure = {
    //   Systolic: parseInt(vitalsBP.Systolic.Value, 10),
    //   Diastolic: parseInt(vitalsBP.Diastolic.Value, 10)
    // };
    // userData.dataCheck();

    if(startup.ptData.db && startup.ptData.db.length){
      var encounterDbData = startup.ptData.db[startup.ptData.db.length - 1];
    }

    if(encounterDbData) {
      var encounter = {
        emails: encounterDbData.emails[0],
        encounterDate: encounterDbData.encounter_date,
        bloodPressure: encounterDbData.blood_pressure,
        targetBP: encounterDbData.target_bp,
        currentMeds: encounterDbData.current_meds
      };
    }else{
      encounter = {
        bloodPressure: null,
        targetBP: null,
        currentMeds: null
      };
    }
      
    return {
      /////////information that will be written to database at end of session:
      //'ids' needed to save information from session to the database 
      ids: startup.ptIdentifier,
      emails: startup.ptData.substrate.demographics.data.EmailAddresses,
      encounter: encounter,
      //currently only one BP reading in vitals. Soon Moxe vitals service will return an array of BP readings

      //todo - populate this variable from the database
      // targetBP: startup.ptData.db[db.length - 1].targetBP;

      /////////other information
      race: startup.ptData.substrate.demographics.data.Race.Text || null,
      // age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      age: 45,
      hasDiabetes: true,
      //todo - hook up to db 
      isOnMedication: false,

      //todo - is there ever a scenario in which a doctor would enter patient data into the db, but not prescribe a medication? if so, we can use an isFirstVisit method. Otherwise, use currentMeds.length (currently using currentMeds.length property) to determine algorithm flow. 
      hasCKD: true,
      races: ['Black or African American', 'Asian', 'Caucasian'],
      
      isAtBPGoal: function() {
        if(this.encounter.targetBP) {
          if(this.encounter.bloodPressure.Systolic >= this.encounter.targetBP.Systolic || this.encounter.bloodPressure.Diastolic >= this.encounter.targetBP.Diastolic) {
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

    this.getTimeScale = function(dateOne, dateTwo) {
      if(dateOne instanceof Date && dateTwo instanceof Date) {
        var dayLengthMs = 86400000;
        var timeDiffDays = (dateTwo.getTime() - dateOne.getTime())/dayLengthMs;

        if(timeDiffDays <= 10) {
          return 'day';
        } else if(45 >= timeDiffDays > 10) {
          return 'week';
        } else if (timeDiffDays > 45) {
          return 'month';
        } else {
          console.warn("There was an error in getTimeScale.");
          return 'month';
        }
      } else {
        throw new Error("Both arguments to getTimeScale should be date objects.");
      }
    };

    this.removeFirstGraphChild = function() {
      var graph = document.getElementById('bp-graph');
      if(graph.children.length > 1){
        graph.removeChild(graph.firstChild);
      }
    };
  }])

  .service('goodRx', ['$http', function($http) {
    this.getPricing = function(name, dosage, callback) {
      
      var params = {
        name: name
      };
      // if(dosage) params.dosage = dosage;

      $http({
        url: '/goodrx/low-price',
        method: 'GET',
        params: params
      }).success(function(data, status) {
        if(callback) callback(data);
      }).error(function(data, status) {
        if(callback) callback(data);
      })
    };
  }])
;
