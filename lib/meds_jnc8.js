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
      medicationName: 'lisinopril', 
      initialdoseRecs: [10],
      targetdoseRecs: [40],
      units: 'mg'
    }, 
    {
      medicationName: 'enalapril', 
      initialdoseRecs: [5],
      targetdoseRecs: [20],
      units: 'mg'
    }
  ],
  'ARB': [
    {
      //gooRx finds 'valsartan/hctz' but not 'valsartan' as given by JNC8
      medicationName: 'valsartan/hctz', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    },
    {
      medicationName: 'losartan', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    }
  ],
  'CCB': [
    {
      medicationName: 'amlodipine', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    },
    {
      medicationName: 'nifedipine', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    },
    {
      medicationName: 'diltiazem', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    },
    {
      medicationName: 'verapamil', 
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    }
  ],
  'Thiazide': [
    {
      medicationName: 'bendroflumethiazide',
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    },
    {
      medicationName: 'chlorthalidone',
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    } 
  ],
  //Beta-blockers
  'BB': [
    {
      medicationName: 'bbDrug',
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    }
  ],
  //Aldosterone antagonists
  'AA': [
    {
      medicationName: 'aaDrug',
      initialdoseRecs: [5],
      targetdoseRecs: [20]
    }, 
  ],
  'Others': [
    {
      medicationName: 'otherDrug',
      initialdoseRecs: [5],
      targetdoseRecs: [20]
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