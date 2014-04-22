'use strict';

angular.module('myApp.services', [])

  .factory('startup', ['$http', '$q', '$rootScope', '$route', '$location', 'substrate', 'db', function($http, $q, $rootScope, $route, $location, substrate, db) {
    
    var ptData = {};
    var ptIdentifier = {};

    var initializeMoxe = function(){
      //stub ptId and orgId. Soon will be populated by SAML request from Moxe dashboard 
      ptIdentifier.ptId = $rootScope.patientId;
      ptIdentifier.orgId = $rootScope.orgId;

      console.log('initializeMoxe called');
      var sid = $location.$$search.sid;
      return $http({
        url: '/moxe/userData',
        method: 'GET',
        params: {
          sid: sid
        }
      }).then(function(err, userData) {
        var result = $q["all"]([substrate.getPatientData(userData.patientId), db.getEncounters({ptId: userData.patientId, orgId: userData.orgId })]);

        return result.then(function(response) {
          $rootScope.showSplash = false;
          ptData.substrate = response[0];
          ptData.db = response[1];
          console.log('substrate', ptData.substrate);
          console.log('db', ptData.db);
        });
      });
    };

    var initializeReturning = function(){
      // get the uid out of the query
      var uid = $location.$$search.uid;
      
      //only moxe users have an orgId
      ptIdentifier.ptId = null;

      console.log('initializeReturning called');
      
      var result = $q["all"]([db.getUserByHash(uid)]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        console.log(response);
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

  .factory('db', ['$http', function($http) {

    var getEncounters = function(ptIdentifier, callback) {
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

    var getUserByHash = function(uid, callback) {
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

    var addEncounter = function(ptIdentifier, encounter, callback) {

      console.log('addEncounter called');
      console.log('ptEncounter', encounter);
      console.log('ptIdentifier', ptIdentifier);
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptIdentifier.ptId,
          orgId: ptIdentifier.orgId,
          //encounter object expects multiple values: curBP, curMeds, curTargetBP
          encounter: encounter
        }
      })
      .success(function(data, status, headers, config){
        callback(data);
      })
      .error(function(data, status, headers, config) {
        console.log('error data', data);
      });
    };

    return {
      getEncounters: getEncounters,
      getUserByHash: getUserByHash,
      addEncounter: addEncounter
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
  .factory('substrateHelpers', function(){
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

    var getMeds = function(medications){
      var meds = [];
      for(var i = 0; i < medications.length; i++){
        var medObj = {
          //only want the first name for now for JNC8 algo to work.
          //some substrate entries are appended with 'extended release'
          //also, all of the medicationName properties in 'meds_jnc8.js' are lowercase 
          medicationName: medications[i].MedicationName.split(' ')[0].toLowerCase() || null,

          //todo- hard code dose, units, className, atMax, targetDoseRecs for now
          dose: 30,
          units: 'mg',
          atMax: medAtMax(),
          targetDoseRecs: [50],
          startDate: medications[i].StartDate.DateTime || null
        };
        medObj.className = meds_jnc8.medAndClassNames[medObj.medicationName] || null, //null if className is not relevant to JNC8 calculator
        meds.push(medObj);
      }
      return meds;
    };

    //todo - finish - this function uses the targetdoseRec property of each med object in 'meds_jnc8' to determine if medication is at max dose or not
    var medAtMax = function(medication, dose){
      //look up recommended targetDose for drug name
      //return dose >= targetDose[targetDose.length - 1]{ 
      return true;
    };

    return {
      getProblems: getProblems,
      problemListContainsDiabetes: problemListContainsDiabetes,
      problemListContainsCKD: problemListContainsCKD,
      getBPs: getBPs,
      getDates: getDates,
      getMeds: getMeds,
      medAtMax: medAtMax,
    };
  })

  .factory('dbHelpers', function(){

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

    var medAtMax = function(medication, dose){
      //look up recommended targetDose for drug name
      //return dose >= targetDose[targetDose.length - 1]{ 
      return true;
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
          targetDoseRecs: [50]
        }
        meds.push(medObj);
      }
      return meds;
    };

    var getMedsStatus = function(dbData) {
      if(dbData[dbData.length-1].curMeds.length > 0) {
        return true;
      }
      return false;
    };

    var getDates = function(dbData){
      var dates = [];

      for(var i = 0; i < dbData.length; i++){
        //convert date strings to date objects 
        dates.push(new Date(dbData[i].encounterDate));
      }
      return dates;
    };

    return {
      getBPs: getBPs,
      getMeds: getMeds,
      getDates: getDates,
      getMedsStatus: getMedsStatus
    };
  })

  .factory('ptHelpers', function(){
    //check that pt has defined all of the necessary data before allowing user to transition to 'dataViz' route
    //split up pt.curBP.systolic/diastolic so we don't have to perform deep-object-tree comparison in $watch expression
    //todo - add && pt.curBP.systolic && pt.curBP.diastolic; currently can't use b/c curBP is not defined when 
    //dataEntry controller is rendered
    var checkPtData = function(pt){

      var props = [pt.age, pt.race, pt.isOnMedication, pt.hasCKD, pt.hasDiabetes, pt.curBP];

      for(var i = 0; i < props.length; i++){
        console.log('check', props[i], props[i] === undefined);
        if(props[i] === undefined){
          return false;
        }
      }
      return true;
    }
    return {
      checkPtData: checkPtData
    };
  })
  //purpose of pt is 1) to parse information gathered from db and substrate requests and store relevant information, 2) to share that information between the dataViz and dataEntry controllers, and 3) to update the database with newest patient information at the end of a session 
  .factory('pt', ['startup', 'substrateHelpers', 'dbHelpers', 'ptHelpers', function(startup, substrateHelpers, dbHelpers, ptHelpers) {

    //'pt' properties defined (or assigned null value) in this function:
    
      //from substrate or database if data exists: 
        //ids, age, race, hasDiabetes, hasCKD, onMedication, 
        //most recent encounter object with current medications, current blood pressure, encounter date

      //from database if data exists: 
        //target blood pressure

    var pt = {};
    pt.hasNeededData = false;

    //todo- where to get information on race choices available for standalone app? 
    pt.races =  ['Black or African American', 'Asian', 'Caucasian'];

    //get data from moxe user 
    if(startup.ptData.substrate){
      console.log('substrate data');
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
      pt.ids = startup.ptIdentifier || {};
      pt.emails = substrateData.demographics.EmailAddresses;

      pt.race = substrateData.demographics.Race.Text || null;
      //age is a string ending in "y"
      pt.age = parseInt(substrateData.demographics.Age.substring(0, substrateData.demographics.Age.length-1), 10) || null;
      pt.hasCKD = substrateHelpers.problemListContainsCKD(problems);
      pt.hasDiabetes = substrateHelpers.problemListContainsDiabetes(problems);
      pt.isOnMedication = false;
    }

    //get data from current user of standalone app, or moxe user 
    if(startup.ptData.db && startup.ptData.db.length){
      console.log('Theoretical dbData: ', startup.ptData.db);
      var dbData = startup.ptData.db;

      //both user types (moxe and standalone) get this info from database 
      pt.targetBPs = dbHelpers.getBPs(dbData, 'curTargetBP')
      pt.curTargetBP = pt.targetBPs[pt.targetBPs.length - 1];

      //user of stand alone app only  
      if(!startup.ptData.substrate){
        pt.bps = dbHelpers.getBPs(dbData, 'curBP');
        pt.targetBPs = dbHelpers.getBPs(dbData, 'curTargetBP');
        pt.isOnMedication = dbHelpers.getMedsStatus(dbData);
        pt.curMeds = dbHelpers.getMeds(dbData);
        pt.encounterDates = dbHelpers.getDates(dbData);
        //add the current encounter date
        pt.encounterDates.push(new Date());

        //'ids' needed to save information from session to the database 
        pt.ids = startup.ptIdentifier;
        pt.emails = dbData[dbData.length - 1].emails;
        pt.emailHash = dbData[dbData.length - 1].emailHash;

        pt.race = dbData[dbData.length - 1].race || null;
        //age is a string ending in "y"
        pt.age = dbData[dbData.length - 1].age || null;

        //need to make truthy/falsy because radio buttons can't be made boolean in angular: http://stackoverflow.com/questions/16048718/angularjs-ng-value-boolean-validation
        //so this way, '1's and '0's sent back from server are made boolean 
        pt.hasCKD = !!dbData[dbData.length - 1].hasCKD;
        pt.hasDiabetes = !!dbData[dbData.length - 1].hasDiabetes;
      }
    //first time user 
    }else{
      //app does not allow user to enter encounter date
      console.log('first time user');
      pt.encounterDates = [new Date()];
      pt.curDate = pt.encounterDates[pt.encounterDates.length - 1];
      pt.bps = [];
      pt.emails = [];
      pt.targetBPs = [];
      pt.ids = {
        ptId: null
      }

      //hard code for testing
      // pt.race = 'Black or African American';
      // pt.age = 45;
      // pt.hasCKD = true;
      // pt.hasDiabetes = true;
      // pt.curBP = { systolic: 155, diastolic: 55};
      // pt.emails[0] = 'skeller88@gmail.com';
      // pt.isOnMedication = false;
    }
    return pt;
  }])

  .factory('graphHelpers', [function() {

    //expects array of bp objects and string that is either 'systolic' or 'diastolic'
    var getBPExtreme = function(bpsArray, keyName) {
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
    var parseBPData = function(pt) {
      var results = [];

      //use 'bps' to determine how many iterations
      //assume that the number of bp and target BP readings are the same 
      for(var i = 0; i < pt.bps.length; i++) {
        var bp = pt.bps[i];

        var curTargetBP = pt.targetBPs[i];

        var encounterDate = pt.encounterDates[i];

        results.push({
          encounterDate: encounterDate,
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          targetDias: curTargetBP.diastolic,
          targetSys: curTargetBP.systolic
        });
      }
      return results;
    };

    var getTimeScale = function(dateOne, dateTwo) {
      console.log('dateOne', dateOne);
      console.log('dateTwo', dateTwo)
      if(dateOne instanceof Date && dateTwo instanceof Date) {
        var dayLengthMs = 86400000;
        var timeDiffDays = (dateTwo.getTime() - dateOne.getTime())/dayLengthMs;

        if(timeDiffDays < 1){
          return 'hour';
        } else if(timeDiffDays <= 10) {
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

    var removeFirstGraphChild = function() {
      var graph = document.getElementById('bp-graph');
      if(graph.children.length > 1){
        graph.removeChild(graph.firstChild);
      }
    };

    return {
      getBPExtreme: getBPExtreme, 
      parseBPData: parseBPData,
      getTimeScale: getTimeScale,
      removeFirstGraphChild: removeFirstGraphChild
    };

  }])

  .service('goodRx', ['$http', function($http) {
    var getPricing = function(name, dosage, callback) {
      
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

    return {
      getPricing: getPricing
    };
  }])
;
