//based on David Kagan's recommendation and JNC8 table 4. All of his recommended meds are included in table 4 except for 'nifedipine'. TODO- fill out all drug options for each class.  
//TODO- possibly store this information in SQL database? 
var meds = {
  'ACEI': [
    { 
      medName: 'lisinopril', 
      initialDoseOpts: [10],
      targetDoseOpts: [40] 
    }, 
    {
      medName: 'enalapril', 
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }
  ],
  'ARB': [
    {
      medName: 'valsartan', 
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
  'Thiazide-type diuretic': [
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
  'Beta-blocker': [
    {
      medName: 'bbDrug',
      initialDoseOpts: [5],
      targetDoseOpts: [20]
    }
  ],
  'Aldosterone antagonist': [
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