//based on David Kagan's recommendation and JNC8 table 4. All of his recommended meds are included in table 4 except for 'nifedipine'. TODO- fill out all drug options for each class.  
//TODO- possibly store this information in SQL database? 
var meds_jnc8 = {};

//ACEI, ARB, CCB, Thiazide-type diuretic
//first line means that these are the classes that should be prescribed and titrated first 
meds_jnc8.numFirstLineMedClasses = 4;

//Substrate API does not give class names for each medication
//the algorithm depends on class names to give accurate recommendations 
//so we need a data structure that provides more efficient access to class names than 'allMeds'
//source: Table 4 of JNC8
meds_jnc8.medAndClassNames = {
  //ACEIs
  'captopril': 'ACEI',
  'lisinopril': 'ACEI',
  'enalapril': 'ACEI',

  //ARBs
  'eprosartan': 'ARB',
  'candesartan': 'ARB',
  'losartan': 'ARB',
  'valsartan': 'ARB',
  'irbesartan': 'ARB',

  //CCBs
  'amlodipine': 'CCB',
  // 'diltiazem extended release' in table 4, but substrate service will likely pass in 'diltiazem'
  'diltiazem': 'CCB',
  'nitrendipine': 'CCB',

  //Thiazides
  'bendroflumethiazide': 'Thiazide',
  'chlorthalidone': 'Thiazide',
  'hydrochlorothiazide': 'Thiazide',
  'indapamide': 'Thiazide',

  //Beta-Blockers
  'atenolol': 'BB',
  'metoprolol': 'BB'
};

//all possible medication classes and medications recommended in each class
//source: Table 4 of JNC8
meds_jnc8.allMeds = {
  'ACEI': [
    { 
      medicationName: 'captopril', 
      initialdoseRecs: [50],
      targetdoseRecs: [150, 200],
      units: 'mg'
    }, 
    { 
      medicationName: 'enalapril', 
      initialdoseRecs: [5],
      targetdoseRecs: [20],
      units: 'mg'
    }, 
    {
      medicationName: 'lisinopril', 
      initialdoseRecs: [10],
      targetdoseRecs: [40],
      units: 'mg'
    }
  ],
  'ARB': [
    {
      medicationName: 'eprosartan', 
      initialdoseRecs: [400],
      targetdoseRecs: [600, 800]
    },
    {
      medicationName: 'candesartan', 
      initialdoseRecs: [4],
      targetdoseRecs: [12, 32]
    },
    {
      medicationName: 'losartan', 
      initialdoseRecs: [50],
      targetdoseRecs: [100]
    },
    {
      //goodRx finds 'valsartan/hctz' but not 'valsartan' as given by JNC8
      medicationName: 'valsartan/hctz', 
      initialdoseRecs: [40, 80],
      targetdoseRecs: [160, 320]
    },
    {
      medicationName: 'irbesartan', 
      initialdoseRecs: [75],
      targetdoseRecs: [300]
    },
  ],
  'CCB': [
    {
      medicationName: 'amlodipine', 
      initialdoseRecs: [2.5],
      targetdoseRecs: [10]
    },
    {
      medicationName: 'diltiazem', 
      initialdoseRecs: [120, 180],
      targetdoseRecs: [360]
    },
    {
      medicationName: 'nitrendipine', 
      initialdoseRecs: [10],
      targetdoseRecs: [20]
    }
  ],
  'Thiazide': [
    {
      medicationName: 'bendroflumethiazide',
      initialdoseRecs: [5],
      targetdoseRecs: [10]
    },
    {
      medicationName: 'chlorthalidone',
      initialdoseRecs: [12.5],
      targetdoseRecs: [12.5, 25]
    },
    {
      medicationName: 'hydrochlorothiazide',
      initialdoseRecs: [12.5, 25],
      //table 4 target dose upper limit is 100, but 
      //footnote in table 4 says that current recommended evidence-based dose that balances 
      //efficacy and safety is 25-50mg daily
      targetdoseRecs: [25, 50]
    },
    {
      medicationName: 'indapamide',
      initialdoseRecs: [1.25],
      targetdoseRecs: [1.25, 2.5]
    } 
  ],
  //Beta-blockers
  'BB': [
    {
      medicationName: 'atenolol',
      initialdoseRecs: [25, 50],
      targetdoseRecs: [100]
    },
    {
      medicationName: 'metoprolol',
      initialdoseRecs: [50],
      targetdoseRecs: [100, 200]
    }
  ]
};

meds_jnc8.combos = {
  firstVisit: {
    nonBlackNoCKD: [
      { className: 'Thiazide',
        meds: meds_jnc8.allMeds.Thiazide 
      },
      { className: 'ACEI',
        meds: meds_jnc8.allMeds.ACEI 
      },
      { className: 'ARB',
        meds: meds_jnc8.allMeds.ARB 
      },
      { className: 'CCB',
        meds: meds_jnc8.allMeds.CCB 
      }
    ],
    blackNoCKD: [
      { className: 'Thiazide',
        meds: meds_jnc8.allMeds.Thiazide 
      },
      { className: 'CCB',
        meds: meds_jnc8.allMeds.CCB 
      }
    ],
    CKD: [
      { className: 'ACEI',
        meds: meds_jnc8.allMeds.ACEI 
      },
      { className: 'ARB',
        meds: meds_jnc8.allMeds.ARB 
      }
    ]
  }
};