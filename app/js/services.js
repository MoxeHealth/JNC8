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
  .factory('pt', ['$rootScope', function($rootScope) {

    return {
      race: $rootScope.patientData.demographics.Race.Text,
      age: parseInt($rootScope.patientData.demographics.Age.substring(0,$rootScope.patientData.demographics.Age.length-1), 10),
      bp: [parseInt($rootScope.patientData.vitals.BloodPressure.Systolic.Value, 10), parseInt($rootScope.patientData.vitals.BloodPressure.Diastolic.Value, 10)],
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
          // meeting goal -- move to data viz to reinforce success and show BP graphs
        }
      } else { // not at BP goals

      }
    } else {
      if(patient.age >= 18) {
        // set targetBP by age and diabetes/CKD logic
        if(!patient.hasDiabetes && !patient.hasCKD) {
          if(patient.age >= 60) {
            patient.targetBP = [150, 90];
            patient.has
          } else if (patient.age < 60) {
            patient.targetBP = [140, 90];
          }
        } else if(patient.hasDiabetes || patient.hasCKD) {
          if(patient.hasDiabetes && !patient.hasCKD) {
            patient.targetBP = [140, 90];
          } else if (patient.hasCKD) {
            patient.targetBP = [140, 90];
          }
        }
      }

        if(!patient.hasCKD) {
          
        }
    }
    //
    // if patient is 18 or over
    //   if no diabetes or CKD
    //     if patient is 60 or older
    //       patient.targetBP = [150, 90]
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
