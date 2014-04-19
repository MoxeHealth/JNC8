'use strict';

angular.module('myApp.services', [])
  .value('version', '0.1')

  .service('orgId', ['$rootScope', function($rootScope){
    return {
      orgId: $rootScope.orgId
    };
  }])


  .service('startup', ['$http', '$q', '$rootScope', '$route', '$location', 'substrate', 'db', function($http, $q, $rootScope, $route, $location, substrate, db) {
    
    var ptData = {};
    var ptIdentifier = {ptId: $rootScope.patientId, orgId: $rootScope.orgId};

    var initializeMoxe = function(){
      console.log('initializeMoxe called');
      var result = $q["all"]([substrate.getPatientData($rootScope.patientId), db.getEncounters(ptIdentifier)]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];
        ptData.db = response[1];
        console.log('substrate', ptData.substrate);
        console.log('db', ptData.db);
      });
    };

    var initializeReturning = function(){
      console.log('initializeReturning called');
      // get the uid out of the query
      var uid = $location.$$search.uid;
      
      var result = $q["all"]([db.getUserByHash(uid)]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.db = response[0];
        console.log('db', ptData.db);
      });
    };

    return {
      initializeMoxe: initializeMoxe,
      initializeReturning: initializeReturning,
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

    this.getUserByHash = function(uid, callback) {
      var result = $http({
        url: '/db/returning',
        method: 'GET',
        params: {
          uid: uid
        }
      });

      return result.then(function(response) {
        return response.data
      })
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
          //encounter object expects multiple values: curBP, curMeds, curTargetBP
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

      var result = $q["all"]({
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

  //parse substrate data to get necessary information for algorithm
  //used by 'pt' service
  .service('substrateHelpers', function(){
    var getProblems = function(problemsArray){
      var problems = {};

      for(var i = 0; i < problemsArray.length; i++){
        problems[problemsArray[i].ProblemName] = true;
      }
      return problems;
    }

    //search for string "Chronic kidney disease"
    var problemListContainsCKD = function(problems){
      for(var problem in problems){
        var name = problem.split(' ').slice(0,3).join(' ');
        if(name === 'Chronic kidney disease'){
          return true;
        }
      }
      return false;
    };

    //search for string "Diabetes mellitus"
    var problemListContainsDiabetes = function(problems){
      for(var problem in problems){
        var name = problem.split(' ').slice(0,2).join(' ');
        if(name === 'Diabetes mellitus'){
          return true;
        }
      }
      return false;
    };

    // expects susbstrate vitals service
    var getBPs = function(vitals){
      var bps = [];
      var vitalsBP = vitals.BloodPressure;

      //currently only one BP reading in vitals. Soon Moxe vitals service will return an array of BP readings
      // for(var i = 0; i < vitalsBP.length; i++){
      //   //need to guard against missing substrate data 
      //   if(!vitalsBP[i]){
      //     continue;
      //   }
      //   var bpObj = {
      //     systolic: parseInt(vitalsBP[i].systolic.Value, 10) || null,
      //     diastolic: parseInt(vitalsBP[i].diastolic.Value, 10) || null,
      //     ResultDateTime: vitalsBP[i].ResultDateTime.DateTime || null
      //   };
      //   bps.push(bpObj);
      // }

      //for now, only one BP reading
      var bloodPressure = {
        systolic: parseInt(vitalsBP.Systolic.Value, 10) || null,
        diastolic: parseInt(vitalsBP.Diastolic.Value, 10) || null,
        //each BloodPressure object will have the same ResultDateTime for both Sys and Dias 
      };
      bps.push(bloodPressure)
      return bps;
    };

    //todo- only place I can find all of the dates 
    var getDates = function(vitals){
      var dates = [];
      var vitalsBP = vitals.BloodPressure;

      //currently only one BP reading in vitals. Soon Moxe vitals service will return an array of BP readings
      // for(var i = 0; i < vitalsBP.length; i++){
 
      //   var date = vitalsBP[i].Diastolic.ResultDateTime.DateTime || null;
      //   bps.push(date);
      // }

      //for now, only one BP reading
      var date = vitalsBP.Diastolic.ResultDateTime.DateTime || null;
      dates.push(date);
      return dates;
    };

    //in request to medications service in 'substrate' service, determine whether active medications are returned or not

    //todo - finish - currently necessary because substrate doesn't store the class name for each medication, but the JNC8 algorithm requires class names to work properly 
    var getclassName = function(medication){

    };

    var getMeds = function(medications){
      var meds = [];
      for(var i = 0; i < medications.length; i++){
        var medObj = {
          //only want the first name for now for JNC8 algo to work.
          //some substrate entries are appended with 'extended release'
          medicationName: medications[i].MedicationName.split(' ')[0] || null,

          //todo- hard code dose, units, className, atMax, targetDoseRecs for now
          dose: 30,
          units: 'mg',
          className: 'ACEI',
          atMax: medAtMax(),
          targetDoseRecs: [50],
          startDate: medications[i].StartDate.DateTime || null
        }
        meds.push(medObj);
      }
      return meds;
    };

    //todo - finish - this function uses the targetdoseRec property of each med object in 'meds_jnc8' to determine if medication is at max dose or not
    var medAtMax = function(medication, dose){
      return true;
    };

    return {
      getProblems: getProblems,
      problemListContainsDiabetes: problemListContainsDiabetes,
      problemListContainsCKD: problemListContainsCKD,
      getBPs: getBPs,
      getDates: getDates,
      getMeds: getMeds,
      getclassName: getclassName,
      medAtMax: medAtMax,
    };
  })

  .service('dbHelpers', function(){

    // 'attr' can either be targetBP or bp
    var getBPs = function(dbData, attr){
      var bps = [];
      //default 
      var attr = attr || 'bp';

      for(var i = 0; i < dbData.length; i++){
        var bpObj;
        if(!dbData[i][attr]){
          bpObj = {
            systolic: null,
            diastolic: null,
            encounterDate: null
          }
        }else{
          bpObj = {
            systolic: parseInt(dbData[i][attr].systolic, 10) || null,
            diastolic: parseInt(dbData[i][attr].diastolic, 10) || null,
            //note slightly different structure from substrate 
            encounterDate: dbData[i].encounterDate || null
          };
        }
        bps.push(bpObj);
      }
      return bps;
    };

    var getMeds = function(dbData){
      var meds = [];
      var curMeds = dbData[dbData.length - 1].curMeds;
      for(var i = 0; i < curMeds.length; i++){
        var medObj = {
          //only want the first name for now for JNC8 algo to work.
          medicationName: curMeds[i].medicationName,

          //todo- hard code dose, units, className, atMax, targetDoseRecs for now
          dose: curMeds[i].dose,
          units: curMeds[i].units,
          className: curMeds[i].className,
          atMax: medAtMax(),
          targetDoseRecs: [50],
          startDate: medications[i].startDate
        }
        meds.push(medObj);
      }
      return meds;
    };

    var getDates = function(dbData){
      var dates = [];

      for(var i = 0; i < dbData.length; i++){
        dates.push(dbData.encounterDate);
      }
      return dates;
    };

    return {
      getBPs: getBPs,
      getMeds: getMeds,
      getDates: getDates
    };
  })

  .factory('ptHelpers', ['pt', 'orgId', function(pt, orgId) {
    var updatePt = function(pt){
      //stand alone app user
      if(!orgId){
        pt.bps.push(pt.curBP);
      }
    }

    return {
      updatePt: updatePt
    }
  }])

  //todo - refactor so that pt calls the 'startup' service only once, not 2x. Currently pt passed into both dataVizCtrl and dataEntryCtrl
  //purpose of pt is 1) to parse information gathered from db and substrate requests and store relevant information, 2) to share that information between the dataViz and dataEntry controllers, and 3) to update the database with newest patient information at the end of a session 
  .factory('pt', ['startup', 'substrateHelpers', 'dbHelpers', function(startup, substrateHelpers, dbHelpers) {

    //'pt' properties defined (or assigned null value) in this function:
    
      //from substrate or database if data exists: 
        //age, race, hasDiabetes, hasCKD, onMedication, 
        //most recent encounter object with current medications, current blood pressure, encounter date

      //from database if data exists: 
        //target blood pressure

    var pt = {};

    //todo- where to get information on race choices available for standalone app? 
    pt.races =  ['Black or African American', 'Asian', 'Caucasian'];

    //get data from moxe user 
    if(startup.ptData.substrate){
      var substrateData = startup.ptData.substrate;
      var problems = substrateHelpers.getProblems(substrateData.problems);

      pt.bps = substrateHelpers.getBPs(substrateData.vitals);
      //assume blood pressure data is in chronological order
      //user of app does not input bp, because patient's bp has already been input into substrate previously in the encounter, before the app was initiated 
      pt.curBP = pt.bps[pt.bps.length - 1];
      
      pt.curMeds = substrateHelpers.getMeds(substrateData.medications);

      pt.encounterDates = substrateHelpers.getDates(substrateData.vitals);
      pt.curDate = pt.encounterDates[pt.encounterDates.length - 1];

      //'ids' needed to save information from session to the database 
      pt.ids = startup.ptIdentifier;
      pt.emails = substrateData.demographics.EmailAddresses;

      pt.race = substrateData.demographics.Race.Text || null;
      //age is a string ending in "y"
      pt.age = parseInt(substrateData.demographics.Age.substring(0, substrateData.demographics.Age.length-1), 10) || null;
      pt.hasCKD = substrateHelpers.problemListContainsCKD(problems);
      pt.hasDiabetes = substrateHelpers.problemListContainsDiabetes(problems);
      pt.isOnMedication = false;
    }

    //get data from current user of standalone app, or moxe user 
    if(startup.pbData && startup.ptData.db.length){
      var dbData = startup.ptData.db;

      //both user types (moxe and standalone) get this info from database 
      pt.targetBPs = dbHelpers.getBPs(dbData, 'targetBP')
      pt.curTargetBP = pt.targetBPs[pt.targetBPs.length - 1];


      //user of stand alone app 
      if(!startup.ptData.substrate){
        pt.bps = dbHelpers.getBPs(dbData, 'bp');
        pt.targetBPs = dbHelpers.getBPs(dbData, 'targetBP');
        pt.curMeds = dbHelpers.getMeds(dbData);
        pt.encounterDates = dbHelpers.getDates(dbData);
        //add the current encounter date
        pt.encounterDates.push(new Date());

        //'ids' needed to save information from session to the database 
        pt.ids = startup.ptIdentifier;
        pt.emails = dbData[0].Emails

        pt.race = dbData.race || null;
        //age is a string ending in "y"
        pt.age = dbData.age || null;
        pt.hasCKD = dbData.hasCKD;
        pt.hasDiabetes = dbData.hasDiabetes;
      }
    }else{
      //app does not allow user to enter encounter date
      pt.encounterDates = [new Date()];
      pt.bps = [];
      pt.targetBPs = [];
    }
    return pt;
  }])

  .service('graphHelpers', [function() {

    //expects array of bp objects and string that is either 'systolic' or 'diastolic'
    this.getBPExtreme = function(bpsArray, keyName) {
      var bpValues = [];

      for(var i = 0; i < bpsArray.length; i++) {
        bpValues.push(bpsArray[i][keyName]);
      }

      if(keyName === 'systolic') {
        var max = Math.max.apply(Math, bpValues);
        return Math.max.apply(Math, bpValues);
      } else if (keyName === 'diastolic') {
        return Math.min.apply(Math, bpValues);
      } else {
        throw new Error("getBPExtreme requires either 'systolic' or 'diastolic' as a key name.");
      }
    };

    //expects result of 'pt' service, which is an object containing keys whose values are arrays
    //iterates through arrays  
    this.parseBPData = function(pt) {
      var results = [];

      //use 'bps' to determine how many iterations
      //assume that the number of bp and target BP readings are the same 
      for(var i = 0; i < pt.bps.length; i++) {
        var bp = pt.bps[i];

        var targetBP = pt.targetBPs[i];

        // var encounterDate = pt.encounterDates[i];
        var encounterDate = new Date("April 17 2014");

        results.push({
          encounterDate: encounterDate,
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          targetDias: targetBP.systolic,
          targetSys: targetBP.diastolic
        });
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
