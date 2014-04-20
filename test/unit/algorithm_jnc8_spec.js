//expected algorithm input with data types

var ptStub = {
  //template values for testing
  //method is from 'pt' service in '/app/services.js'
  isAtBPGoal: function() {
    if(this.targetBP) {
      if(this.bloodPressure.Systolic >= this.targetBP.Systolic || this.bloodPressure.Diastolic >= this.targetBP.Diastolic) {
        return false;
      }
      return true;
    } else {
      throw new Error ("Patient's target BP hasn't been set.");
    }
  }
  /* the following values are populated in the specs:
  // possible races: 'Black or African American', 'Asian', 'Caucasian'
  race: 'string' 
  age: integer
  bloodPressure: {
    Systolic: integer
    Diastolic: integer
  },
  curMeds: [{'ACEI': 'lisinopril', atMax: true}],
  hasDiabetes: boolean,
  hasCKD: boolean,
  isAtBPGoal: boolean,
  isOnMedication: boolean
  targetBP: integer
  */
};

describe('meds', function(){
  it('data structure is an object containing keys whose values are arrays of objects', function(){
    var type = typeof meds;
    expect(type).toBe('object');
  });

  //todo - finish checking meds data structure
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

  it('returns a target BP of 150/90 if the patient is 60 years old and older and doesn\'t have diabetes or CKD', function(){
    var pt = {
      age: 60,
      hasDiabetes: false,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 150, Diastolic: 90 });
  });

  it('returns a targetBP of 140/90 if the patient does not meet any one of the criteria for having a 150/90 target BP', function(){
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

describe('chooseNextMeds returns proper medication recommendations', function(){
  it('patient taking either ACEI or ARB', function(){
    var curMeds = [
      {className: 'ACEI'}
    ]
    var nextMeds = algorithm.methods.chooseNextMeds(curMeds);
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

  it('patient taking CCB', function(){
    var curMeds = [
      {className: 'CCB'}
    ]
    var nextMeds = algorithm.methods.chooseNextMeds(curMeds);
    var containsACEI = _.some(nextMeds, function(med){ return med.className === 'ACEI';
    });
    var containsARB = _.some(nextMeds, function(med){ return med.className === 'ARB';
    });
    var containsThiazide = _.some(nextMeds, function(med){ return med.className === 'Thiazide';
    });
    var containsCCB = _.some(nextMeds, function(med){ return med.className === 'CCB';
    });

    expect(containsACEI).toEqual(true);
    expect(containsARB).toEqual(true);
    expect(containsThiazide).toEqual(true);
    expect(containsCCB).toEqual(false);
  });

  //todo if time and clinician input received - finish checking data structure
});

//generateRecs tests depend on chooseNextMeds method working properly 
describe('generateRecs for patient taking no meds (assumed to be first visit)', function(){
  var pt = {
    age: 60,
    hasDiabetes: false,
    isAtBPGoal: ptStub.isAtBPGoal,
    //predefined so that the following specs aren't dependent on generateTarget method
    targetBP: { Systolic: 150, Diastolic: 90 }
  };

  it('continue treatment if patient has reached the target BP', function(){
    pt.bloodPressure = { Systolic: 120, Diastolic: 80 };
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.continueTreatment);
    expect(algoGeneratedRecs.medRecs).toEqual([]);
  });

  it('nonblack patient', function(){
    pt.bloodPressure = { Systolic: 160, Diastolic: 90 };
    pt.race = 'Asian';
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.nonBlackNoCKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.nonBlackNoCKD);
  });

  it('black patient with no CKD', function(){
    pt.bloodPressure = { Systolic: 160, Diastolic: 90 };
    pt.race = algorithm.opts.races.black;
    pt.hasCKD = false;
    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.blackNoCKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.blackNoCKD);
  });

  it('patient of any race with CKD', function(){
    pt.bloodPressure = { Systolic: 160, Diastolic: 90 };
    pt.race = algorithm.opts.races.black;
    pt.hasCKD = true;

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.firstVisit.CKD);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.combos.firstVisit.CKD);
  });
});

describe('generateRecs for patient taking one medication', function(){
  var pt = {
    age: 60,
    hasDiabetes: false,
    isAtBPGoal: ptStub.isAtBPGoal,
    bloodPressure: { Systolic: 160, Diastolic: 90 },
    //predefined so that the following specs aren't dependent on generateTarget method
    targetBP: { Systolic: 150, Diastolic: 90 }
  };

  it('increase dose of current medication if medication is not at max dose', function(){
    pt.encounter = {
      curMeds: [
        {className: 'CCB', atMax: false}
      ]
    };

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.followUpVisitMaxNotReached);
    expect(algoGeneratedRecs.medRecs).toEqual([]);
  });

  it('add additional medication if medication is  at max dose', function(){
    pt.encounter = {
      curMeds: [
        {className: 'CCB', atMax: true}
      ]
    };

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.followUpVisitMaxReached);
    expect(algoGeneratedRecs.medRecs).toEqual(algorithm.methods.chooseNextMeds(pt.encounter.curMeds));
    expect(algoGeneratedRecs.medRecs.length).toEqual(meds.numFirstLineMedClasses - 1);
  });
});

describe('generateRecs for patient taking two medications', function(){
  var pt;
  beforeEach(function(){
    pt = {
      age: 60,
      hasDiabetes: false,
      isAtBPGoal: ptStub.isAtBPGoal,
      bloodPressure: { Systolic: 160, Diastolic: 90 },
      //predefined so that the following specs aren't dependent on generateTarget method
      targetBP: { Systolic: 150, Diastolic: 90 },
      encounter: {
        curMeds: [{className: 'CCB', atMax: true}]
      }
    };
  });

  it('increase dose of current medication if medication is not at max dose', function(){
    pt.encounter.curMeds.push({className: 'Thiazide', atMax: false});

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.followUpVisitMaxNotReached);
    expect(algoGeneratedRecs.medRecs).toEqual([]);
  });

  it('add additional medication if medication is at max dose', function(){
    pt.encounter.curMeds.push({className: 'Thiazide', atMax: true});

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.followUpVisitMaxReached);
    expect(algoGeneratedRecs.medRecs).toEqual(algorithm.methods.chooseNextMeds(pt.encounter.curMeds));
    expect(algoGeneratedRecs.medRecs.length).toEqual(meds.numFirstLineMedClasses - 2);
  });
});

describe('generateRecs for patient taking three medications', function(){

  var pt;

  beforeEach(function(){
    pt = {
      age: 60,
      hasDiabetes: false,
      isAtBPGoal: ptStub.isAtBPGoal,
      bloodPressure: { Systolic: 160, Diastolic: 90 },
      //predefined so that the following specs aren't dependent on generateTarget method
      targetBP: { Systolic: 150, Diastolic: 90 },
      encounter: {
        curMeds: [
          {className: 'CCB', atMax: true}, 
          {className: 'ACEI', atMax: true}
        ]
      }
    };
  });

  it('increase dose of current medication if medication is not at max dose', function(){
    pt.encounter.curMeds.push({className: 'Thiazide', atMax: false});

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.followUpVisitMaxNotReached);
    expect(algoGeneratedRecs.medRecs).toEqual([]);
  });

  it('recommend medication classes previously not recommended as well as specialist referral if medication is at max dose', function(){
    pt.encounter.curMeds.push({className: 'Thiazide', atMax: true});

    var algoGeneratedRecs = algorithm.methods.generateRecs(pt);

    expect(algoGeneratedRecs.recMsg).toEqual(algorithm.opts.recMessages.allFollowUpVisits + " " + algorithm.opts.recMessages.referralVisit);
    expect(algoGeneratedRecs.medRecs).toEqual(meds.allMeds.Others);
    expect(algoGeneratedRecs.medRecs.length).toEqual(1);
  });
});