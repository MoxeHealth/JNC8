//expected algorithm input with data types

var ptStub = {
  //template values for testing
  //method is from 'pt' service in '/app/services.js'
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
  /* the following values are populated in the specs:
  // possible races: 'Black or African American', 'Asian', 'Caucasian'
  race: 'string' 
  age: integer
  currentBP: {
    Systolic: integer
    Diastolic: integer
  },
  currentMeds: [{'ACEI': 'lisinopril', atMax: true}],
  hasDiabetes: boolean,
  hasCKD: boolean,
  isAtBPGoal: boolean,
  isOnMedication: boolean
  targetBP: integer
  */
};

// var medCombos = {
//   ACEI_ARB: [
//     { ACEI: meds.allMeds.ACEI }, 
//     { ARB: meds.allMeds.ARB }
//   ],
//   ACEI_ARB_CCB: [
//     { ACEI: meds.allMeds.ACEI },
//     { ARB: meds.allMeds.ARB },
//     CCB: meds.allMeds.CCB
//   ],
//   ACEI_ARB_Thiazide: [
//     { ACEI: meds.allMeds.ACEI }, 
//     { ARB: meds.allMeds.ARB },
//     Thiazide: meds.allMeds.Thiazide
//   ],
//   CCB_Thiazide: [
//     { CCB: meds.allMeds.CCB }, 
//     { Thiazide: meds.allMeds.Thiazide }
//   ],
//   Others: [
//     { CCB: meds.allMeds.CCB }, 
//     { Thiazide: meds.allMeds.Thiazide }
//   ]
// };

describe('meds', function(){
  it('data structure is an object containing keys whose values are arrays of objects', function(){
    var type = typeof meds;
    expect(type).toBe('object');
  });

  //todo if time and clinician input received - finish checking data structure
});

describe('algorithm generateTarget', function(){

  it('returns a targetBP if the patient already has one', function(){
    var pt = {
      targetBP: {
        Systolic: 120,
        Diastolic: 80
      },
      age: 40
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 120, Diastolic: 80 });
  });

  it('returns a targetBP of 150/90 if the patient is 60 years old and older and doesn\'t have diabetes or CKD', function(){
    var pt = {
      age: 60,
      hasDiabetes: false,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 150, Diastolic: 90 });
  });

  it('returns a targetBP of 140/90 if the patient does not meet any one of the criteria for having a 150/90 target', function(){
    //disqualified by age
    var pt = {
      age: 50,
      hasDiabetes: false,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });

    //disqualified by diabetes
    var pt = {
      age: 60,
      hasDiabetes: true,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });

    //disqualified by CKD
    var pt = {
      age: 60,
      hasDiabetes: false,
      hasCKD: true
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });
  });
});
describe('chooseNextMeds', function(){
  it('should generate the proper next meds for a patient taking either ACEI or ARB', function(){
    var currentMeds = [
      {className: 'ACEI'}
    ]
    var nextMeds = algorithm.methods.chooseNextMeds(currentMeds);
    console.log(nextMeds);
    var containsACEI = _.some(nextMeds, function(med){ return med.className === 'ACEI';
    });
    var containsARB = _.some(nextMeds, function(med){ return med.className === 'ARB';
    });
    var containsThiazide = _.some(nextMeds, function(med){ return med.className === 'Thiazide';
    });
    var containsCCB = _.some(nextMeds, function(med){ return med.className === 'CCB';
    });

    expect(containsACEI).toEqual(false);
    expect(containsARB).toEqual(false);
    expect(containsThiazide).toEqual(true);
    expect(containsCCB).toEqual(true);
  });

  it('should generate the proper next meds for a patient taking CCB', function(){
    var currentMeds = [
      {className: 'CCB'}
    ]
    console.log(currentMeds);
    var nextMeds = algorithm.methods.chooseNextMeds(currentMeds);
    console.log(nextMeds);
    var containsACEI = _.some(nextMeds, function(med){ return med.className === 'ACEI';
    });
    var containsARB = _.some(nextMeds, function(med){ return med.className === 'ARB';
    });
    var containsThiazide = _.some(nextMeds, function(med){ return med.className === 'Thiazide';
    });
    var containsCCB = _.some(nextMeds, function(med){ return med.className === 'CCB';
    });

    expect(containsACEI).toEqual(true);
    // expect(containsARB).toEqual(true);
    // expect(containsThiazide).toEqual(true);
    // expect(containsCCB).toEqual(false);
  });
});

describe('generateRecs for first visit', function(){
  var pt = {
    age: 60,
    hasDiabetes: false,
    isAtBPGoal: ptStub.isAtBPGoal
  };
  //target BP will be 150/90
  var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

  it('recommends to continue treatment if patient has reached the target BP', function(){
    pt.currentBP = { Systolic: 120, Diastolic: 80 };
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt, algoGeneratedTargetBP);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.continueTreatment);
    expect(algoGeneratedRecs.medRecs).toEqual([]);
  });

  it('generates proper recs for a nonblack patient with no CKD who is taking no meds', function(){
    pt.currentBP = { Systolic: 160, Diastolic: 90 };
    pt.race = 'Asian';
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt, algoGeneratedTargetBP);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.nonBlackNoCKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.nonBlackNoCKD);
  });

  it('generates proper recs for a black patient with no CKD who is taking no meds', function(){
    pt.currentBP = { Systolic: 160, Diastolic: 90 };
    pt.race = algorithm.opts.races.black;
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt, algoGeneratedTargetBP);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.blackNoCKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.blackNoCKD);
  });

  it('generates proper recs for a patient with CKD who is taking no meds', function(){
    pt.currentBP = { Systolic: 160, Diastolic: 90 };
    pt.race = algorithm.opts.races.black;
    pt.hasCKD = true;

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt, algoGeneratedTargetBP);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.CKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.CKD);
  });

  //todo if time and clinician input received - finish checking data structure
});