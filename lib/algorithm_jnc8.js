var algorithm = function(pt){
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
  console.log('pt', pt);
  //expecting to be an array of objects:
  /*[{
      className: 'ACE', medName: 'lisinopril', dosage: 30mg', 
      atMax: false, 
      encounter: {id: id, date: date} 
    }] 
    */
  var algorithm = {};

  var currentMeds = pt.currentMeds || [];


  algorithm.recMessages = {
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
  };

  var recommendation = {
    status: '',
    message: ''
  };

  //generateTarget is a property of algorithm so that the function can be tested in spec file without polluting global scope 
  algorithm.generateTarget = function() {
    if(pt.hasTargetBP()){
      return [targetBP.systolic, targetBP.diastolic]; 
    } else {
      if(pt.age >= 18) {
        // set targetBP by age and diabetes/CKD logic
        if(!pt.hasDiabetes && !pt.hasCKD && pt.age >= 60) {
          console.log('>60, no diabetes or CKD');
          return [150, 90];
        }else{
          console.log('other goal');
          return [140, 90];
        }
      } else {
        console.warn("Patient is under 18.");
        return;
      }
    }
  };

  algorithm.generateRecs = function(){
    if(pt.hasTargetBP()){
      if(pt.isAtBPGoal()) {
        return {
          recMsg: algorithm.recMessages.continueTreatment,
          medRecs: [] //todo- how does algorithm handle no medRecs? confirm empty array is a good solution
        };
      }
    }else{
      if(!pt.currentMeds){
        if(!pt.hasCKD) {
          if(pt.race !== "Black or African American") {
            return {
              recMsg: algorithm.recMessages.firstVisit.nonBlackNoCKD,
              medRecs: {
                ACEI: meds.ACEI, 
                ARB: meds.ARB,
                CCB: meds.CCB
              }
            };
          } else if(pt.race === "Black or African American") {
            return {
              recMsg: algorithm.recMessages.firstVisit.blackNoCKD,
              medRecs: {
                thiazide: meds.thiazide, 
                CCB: meds.CCB
              }
            };
          }
        } else if(pt.hasCKD) {
          return {
            recMsg: algorithm.recMessages.firstVisit.CKD,
            medRecs: {
              ACEI: meds.ACEI, 
              ARB: meds.ARB
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
                recMsg: algorithm.recMessages.allFollowUpVisits + ' ' + algorithm.recMessages.followUpVisitMaxReached,
                medRecs: {
                  thiazide: meds.thiazide, 
                  CCB: meds.CCB
                }
              };
            }else if(currentMeds[0].className === 'CCB' ) {
              return {
                recMsg: algorithm.recMessages.allFollowUpVisits + ' ' + algorithm.recMessages.followUpVisitMaxReached,
                medRecs: {
                  thiazide: meds.thiazide, 
                  ACEI: meds.ACEI, 
                  ARB: meds.ARB
                }
              };
            }else if(currentMeds[0].className === 'thiazide') {
              return {
                recMsg: algorithm.recMessages.allFollowUpVisits + ' ' + algorithm.recMessages.followUpVisitMaxReached,
                medRecs: {
                  CCB: meds.CCB,
                  ACEI: meds.ACEI, 
                  ARB: meds.ARB
                }
              };
            }
          }else{
            return {
              recMsg: algorithm.recMessages.allFollowUpVisits + ' ' + algorithm.recMessages.followUpVisitMaxNotReached,
              medRecs: {}
            };
          }
        }else if((currentMeds[0].atMax && currentMeds[1].atMax) || currentMeds.length > 2){
          algoResults.medRecs = {
            OtherClasses: meds.OtherClasses
          };
        }else{
          return {
            recMsg: algorithm.recMessages.allFollowUpVisits + ' ' + algorithm.recMessages.followUpVisitMaxNotReached,
            medRecs: {}
          };
        }
      }
    }
  };
  // collect additional information where needed

  algoResults.targetBP = algorithm.generateTarget();
  algoResults.recs = algorithm.generateRecs();

  return algoResults; 
};