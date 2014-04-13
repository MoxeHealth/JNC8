//based on David Kagan's recommendation and JNC8 table 4. All of his recommended meds are included in table 4 except for 'nifedipine'. TODO- fill out all drug options for each class.  
//TODO- possibly store this information in SQL database? 
var meds = {};

//ACEI, ARB, CCB, Thiazide-type diuretic
//first line means that these are the classes that should be prescribed and titrated first 
meds.numFirstLineMedClasses = 4;

//all possible medication classes and medications recommended in each class
//source: Table 4 of JNC8
meds.allMeds = {
  'ACEI': [
    { 
      medName: 'lisinopril', 
      initialDoseRecs: [10],
      targetDoseRecs: [40],
      units: 'mg'
    }, 
    {
      medName: 'enalapril', 
      initialDoseRecs: [5],
      targetDoseRecs: [20],
      units: 'mg'
    }
  ],
  'ARB': [
    {
      //gooRx finds 'valsartan/hctz' but not 'valsartan' as given by JNC8
      medName: 'valsartan/hctz', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    },
    {
      medName: 'losartan', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    }
  ],
  'CCB': [
    {
      medName: 'amlodipine', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    },
    {
      medName: 'nifedipine', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    },
    {
      medName: 'diltiazem', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    },
    {
      medName: 'verapamil', 
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    }
  ],
  'Thiazide': [
    {
      medName: 'bendroflumethiazide',
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    },
    {
      medName: 'chlorthalidone',
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    } 
  ],
  //Beta-blockers
  'BB': [
    {
      medName: 'bbDrug',
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    }
  ],
  //Aldosterone antagonists
  'AA': [
    {
      medName: 'aaDrug',
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    }, 
  ],
  'Others': [
    {
      medName: 'otherDrug',
      initialDoseRecs: [5],
      targetDoseRecs: [20]
    }
  ]
};

meds.combos = {
  firstVisit: {
    nonBlackNoCKD: [
      { className: 'Thiazide',
        meds: meds.allMeds.Thiazide 
      },
      { className: 'ACEI',
        meds: meds.allMeds.ACEI 
      },
      { className: 'ARB',
        meds: meds.allMeds.ARB 
      },
      { className: 'CCB',
        meds: meds.allMeds.CCB 
      }
    ],
    blackNoCKD: [
      { className: 'Thiazide',
        meds: meds.allMeds.Thiazide 
      },
      { className: 'CCB',
        meds: meds.allMeds.CCB 
      }
    ],
    CKD: [
      { className: 'ACEI',
        meds: meds.allMeds.ACEI 
      },
      { className: 'ARB',
        meds: meds.allMeds.ARB 
      }
    ]
  }
};