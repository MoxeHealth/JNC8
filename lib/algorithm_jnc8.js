var algorithm = {};

//all options and methods are properties of algorithm object for encapsulation purposes, and also so that any part of the algorithm's options or methods can be tested in isolation

algorithm.opts = {
  meds: meds,
  recMessages: {
    continueTreatment: "Continue current treatment and monitoring.",
    
    titrationStrategies: {
      a: "Maximize first medication before adding second.",
      b: "Add second medication before reaching maximum dose of first medication.",
      c: "Start with two medication classes, separately or as fixed-dose combination."
    },
    firstVisit: {
      nonBlackNoCKD: "Initiate thiazide-type diuretic or ACEI or ARB or CCB, alone or in combination. ACEIs and ARBs should not be used in combination.",
      blackNoCKD: "Initiate thiazide-type diuretic or CCB, alone or in combination.",
      CKD: "Initiate ACEI or ARB, alone or in combination with other drug class. ACEIs and ARBs should not be used in combination."
    },
    allFollowUpVisits: "Reinforce medication and lifestyle adherence.",
    followUpVisitMaxNotReached: "Max dose of current medication not reached; titrate current medication.",
    followUpVisitMaxReached: "Current medication is at maximum recommended dose. Add and titrate one of the following additional medication classes:",
    referralVisit: "Add additional medication class(eg, &#914;-blocker, aldosterone antagonist, or others) and/or refer to physician with expertise in hypertension management."
    //the following messages are commented out for now because we're assuming only titration strategy
    //A will be used. May use these messages in the future because they are copied directly 
    //from JNC8 algorithm: 
    // allFollowUpVisits: "Reinforce medication and lifestyle adherence.",
    // secondVisit: {
    //   ab: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
    //   c: "Titrate doses of initial medication to maximum."
    // },
    // thirdVisit: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
    // fourthVisit: "Add additional medication class(eg, &#914;-blocker, aldosterone antagonist, or others) and/or refer to physician with expertise in hypertension management."
  }
};

algorithm.methods = {
  //algorithm based on JNC8 HTN treatment guidelines 
  //inputs-  patient data from 'pt' service and medication list from meds_jnc8.js
  //outputs- recommendation string, array of recommended med strings, and status string
  //currently algorithm assumes that doctor will determine max dose of each medication (boolean value)
  //and that doctor will only use titration strategy A 
  //3 possible statuses: 'bad', 'ok', 'good'

  //todo - refactor to 'algorithmData' to differentiate from 'algorithm service'
  //todo - refactor pt so that it grabs the correct data from the database
  /*bloodPressure: {[  
    { 
      systolic: {
        value: "120",
        encounterId: {
          $id: "84"
        }
      },
      diastolic: {
        value: "60",
        encounterId: {
          $id: "84"
        }
      }
    },
    {
     ...
    }
  ]}
  */

  runAlgorithm: function(pt){
    var algoResults = {};
    algoResults.targetBP = algorithm.methods.generateTarget(pt);
    console.log(algoResults.targetBP);
    algoResults.recs = algorithm.methods.generateRecs(pt);

    return algoResults; 
  },

  //input - patient object
  //output - object with two keys, systolic and diastolic, whose values are integers
  generateTarget: function(pt) {
    console.log(pt)
    if(pt.targetBP){
      return pt.targetBP;
    } else {
      if(pt.age >= 18) {
        // set targetBP by age and diabetes/CKD logic
        if(!pt.hasDiabetes && !pt.hasCKD && pt.age >= 60) {
          console.log('targetBP for people >60 with no diabetes or CKD');
          return {
            Systolic: 150,
            Diastolic: 90
          };
        }else{
          console.log('other targetBP');
          return {
            Systolic: 140,
            Diastolic: 90
          };
        }
      } else {
        console.warn("Patient is under 18.");
        return;
      }
    }
  },

  generateRecs: function(pt){
    //expecting to be an array of objects:
    /*[{
        className: 'ACE', medName: 'lisinopril', dosage: 30mg', 
        atMax: false, 
        encounter: {id: id, date: date} 
      }] 
      */
    var currentMeds = pt.currentMeds || [];

    if(pt.hasTargetBP()){
      if(pt.isAtBPGoal()) {
        return {
          recMsg: algorithm.opts.recMessages.continueTreatment,
          medRecs: [] //todo- how does algorithm handle no medRecs? confirm empty array is a good solution
        };
      }
    }else{
      if(!pt.currentMeds){
        if(!pt.hasCKD) {
          if(pt.race !== "Black or African American") {
            return {
              recMsg: algorithm.opts.recMessages.firstVisit.nonBlackNoCKD,
              medRecs: {
                ACEI: algorithm.tops.meds.ACEI, 
                ARB: algorithm.tops.meds.ARB,
                CCB: algorithm.tops.meds.CCB
              }
            };
          } else if(pt.race === "Black or African American") {
            return {
              recMsg: algorithm.opts.recMessages.firstVisit.blackNoCKD,
              medRecs: {
                thiazide: algorithm.tops.meds.thiazide, 
                CCB: algorithm.tops.meds.CCB
              }
            };
          }
        } else if(pt.hasCKD) {
          return {
            recMsg: algorithm.opts.recMessages.firstVisit.CKD,
            medRecs: {
              ACEI: algorithm.tops.meds.ACEI, 
              ARB: algorithm.tops.meds.ARB
            }
          };
        }
      }else{
        //added spaces between else statements for readability
        //this conditional checks if doctor has previously entered 
        if(currentMeds.length === 1) {
          if(currentMeds[0].atMax) {
            if(currentMeds[0].className === 'ACEI' || 'ARB') {
              return {
                recMsg: algorithm.opts.recMessages.allFollowUpVisits + ' ' + algorithm.opts.recMessages.followUpVisitMaxReached,
                medRecs: {
                  thiazide: algorithm.tops.meds.thiazide, 
                  CCB: algorithm.tops.meds.CCB
                }
              };
            }else if(currentMeds[0].className === 'CCB' ) {
              return {
                recMsg: algorithm.opts.recMessages.allFollowUpVisits + ' ' + algorithm.opts.recMessages.followUpVisitMaxReached,
                medRecs: {
                  thiazide: algorithm.tops.meds.thiazide, 
                  ACEI: algorithm.tops.meds.ACEI, 
                  ARB: algorithm.tops.meds.ARB
                }
              };
            }else if(currentMeds[0].className === 'thiazide') {
              return {
                recMsg: algorithm.opts.recMessages.allFollowUpVisits + ' ' + algorithm.opts.recMessages.followUpVisitMaxReached,
                medRecs: {
                  CCB: algorithm.tops.meds.CCB,
                  ACEI: algorithm.tops.meds.ACEI, 
                  ARB: algorithm.tops.meds.ARB
                }
              };
            }
          }else{
            return {
              recMsg: algorithm.opts.recMessages.allFollowUpVisits + ' ' + algorithm.opts.recMessages.followUpVisitMaxNotReached,
              medRecs: {}
            };
          }
        }else if((currentMeds[0].atMax && currentMeds[1].atMax) || currentMeds.length > 2){
          algoResults.medRecs = {
            OtherClasses: algorithm.tops.meds.OtherClasses
          };
        }else{
          return {
            recMsg: algorithm.opts.recMessages.allFollowUpVisits + ' ' + algorithm.opts.recMessages.followUpVisitMaxNotReached,
            medRecs: {}
          };
        }
      }
    }
  }
};