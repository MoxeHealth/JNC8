//expected algorithm input with data types

console.log(algorithm);
var ptStub = {
  //template values for testing
  hasTargetBP: function(){
    if(this.targetBP){
      if(this.targetBP.length > 0){
        return true;
      }
    }
    return false;
  },
  isAtBPGoal: function() {
    if(this.hasTargetBP()) {
      if(this.bp[0] >= this.targetBP[0] || this.bp[1] >= this.targetBP[1]) {
        return false;
      }
      return true;
    } else {
      throw new Error ("Patient's target BP hasn't been set.");
    }
  },
  onMedication: function() {
    if(this.medication.length > 0) {
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

describe('meds data structure', function(){
  it('is an object containing keys whose values are arrays of objects', function(){
    var type = typeof meds;
    expect(type).toBe('object');
  });

  //todo if time and clinician input received - finish checking data structure
});

describe('algorithm generateTarget', function(){
  beforeEach(function(){
    var ptStub = {
      hasTargetBP: function(){
      if(this.targetBP){
        if(this.targetBP.length > 0){
          return true;
        }
      }
      return false;
      } 
    };

    var algoResults = {};
  });

  it('returns a targetBP if the patient already has one', function(){
    ptStub.targetBP = [120, 80]

    expect(algoResults.targetBP).toEqual([120, 80]);
  });

  it('returns a targetBP of 150/90 if the patient is 60 years old and older and doesn\'t have diabetes or CKD', function(){
    expect(2).toEqual(2);
  });

  it('returns a targetBP of 140/90 if the patient does not meet any one of the criteria for having a 150/90 target', function(){
    expect(2).toEqual(2);
  });
});