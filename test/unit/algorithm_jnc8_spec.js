//expected algorithm input with data types

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
  // beforeEach(function(){
  //   var ptStub = {
  //     hasTargetBP: function(){
  //       if(this.targetBP){
  //         if(this.targetBP.length > 0){
  //           return true;
  //         }
  //       }
  //       return false;
  //     } 
  //   };
  // });

  it('returns a targetBP if the patient already has one', function(){
    var pt = {
      targetBP: {
        Systolic: 120,
        Diastolic: 80
      },
      age: 40
    };

    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual(
      { Systolic: 120, Diastolic: 80 }
    );
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
    //age
    var pt = {
      age: 50,
      hasDiabetes: false,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });

    //diabetes
    var pt = {
      age: 60,
      hasDiabetes: true,
      hasCKD: false
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });

    //CKD
    var pt = {
      age: 60,
      hasDiabetes: false,
      hasCKD: true
    };
    var algoGeneratedTargetBP = algorithm.methods.generateTarget(pt);

    expect(algoGeneratedTargetBP).toEqual({ Systolic: 140, Diastolic: 90 });
  });
});