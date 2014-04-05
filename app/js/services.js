'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')
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

      return result.then(function(response) {
        var patientData = {
          demographics: response.demographics.data,
          vitals: response.vitals.data,
          lab: response.lab.data
        };
        return callback(patientData);
      });
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
      getPatientData: getPatientData
    };

  }])
  .factory('algorithmSvc', [function() {
    //returns recommendation string and status
    //3 possible statuses: 'bad', 'ok', 'good'
    var patient = {
      // patient information:
      // race
      // age
      // bp { [systolic, diastolic, date], [systolic, diastolic, date]}
      // diabetes (bool)
      // CKD (bool)
      // onMedication (bool)
      // medications = {
      //  medName : {
      //    dose: num,
      //    maxDose: bool,
      //    unit: 'str' (ml, mg, etc)
      //   }
      // }
      // targetBP: [systolic, diastolic]
      // isAtBPGoal: bool
    };

    var recMessages = {
      continue: "Continue current treatment and monitoring.",
      initialVisit: {
        nonBlackNoCKD: "",
        blackNoCKD: "",
        CKD: ""
      },


    };

    var hasBPGoal = function(patient){
      if(patient.targetBP){
        if(patient.targetBP.length > 0){
          return true;
        }
      }
      return false;
    };

    var isAtBPGoal = function(currentBP, targetBP) {
      if(currentBP[0] >= targetBP[0] || currentBP[1] >= targetBP[1]) {
        return false;
      }
      return true;
    };

    var recommendations = {

    };

    if(hasBPGoal(patient)){
      if(isAtBPGoal(patient.currentBP, patient.targetBP)){
        return {

        }
      }
    }
    //
    // if patient is 18 or over
    //   if no diabetes or CKD
    //     if patient is 60 or older
    //       patient.targetBP = [150, 90]
    //       if patient.race is not black
    //     else if under 60
    //       patient.targetBP = [140,90]
    //   else if diabetes or CKD
    //     if diabetes and not CKD
    //       patient.targetBP = [140,90]
    //     else if CKD
    //       patient.targetBP = [140,90]
    //
    //   if !CKD
    //     if nonblack
    //
    //     else if black
    //
    //   else if CKD
    //
    // else
    //   console log: patient is under 18!


    if(patient.age >= 18) {

    }

    // collect additional information where needed

    return {
      // patient
      // recommendation based on algo
      //
    };
  }])
  ;
