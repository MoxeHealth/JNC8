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
      initialDoseOpts: [10],
      targetDoseOpts: [40],
      units: 'mg'
    }, 
    {
      medName: 'enalapril', 
      initialDoseOpts: [5],
      targetDoseOpts: [20],
      units: 'mg'
    }
  ],
  'ARB': [
    {
      //gooRx likes 'diovan'
      medName: 'valsartan/hctz', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    },
    {
      medName: 'losartan', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }
  ],
  'CCB': [
    {
      medName: 'amlodipine', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    },
    {
      medName: 'nifedipine', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    },
    {
      medName: 'diltiazem', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    },
    {
      medName: 'verapamil', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }
  ],
  'Thiazide': [
    {
      medName: 'bendroflumethiazide',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    },
    {
      medName: 'chlorthalidone',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    } 
  ],
  //Beta-blockers
  'BB': [
    {
      medName: 'bbDrug',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }
  ],
  //Aldosterone antagonists
  'AA': [
    {
      medName: 'aaDrug',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }, 
  ],
  'Others': [
    {
      medName: 'otherDrug',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
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