/* global d3 */
'use strict';

/* Services */

angular.module('myApp.services', [])
  .value('version', '0.1')
  .service('startup', ['$http', '$q','$rootScope', 'substrate', 'db', function($http, $q, $rootScope, substrate, db) {
    console.log("into startup");
    var ptData = {};

    var initialize = function(){
      console.log('Initialize called');


    //TODO - wrap following code in post request from Epic
      var result = $q.all([substrate.getPatientData($rootScope.patientId), db.getEncounters($rootScope.patientId)
      ]);

      return result.then(function(response) {
        $rootScope.showSplash = false;
        ptData.substrate = response[0];
        ptData.db = response[1].data;
      });
    };

    return {
      initialize: initialize,
      ptData: ptData
    };
  }])

  .service('db', ['$http', function($http) {
    this.getEncounters = function(ptId, callback) {
      console.log("ptId in getEcounters:" + ptId);
      return $http({
        url: '/db/encounters',
        method: 'GET',
        params: {
          ptId: ptId
        }
      });
    };

    this.addEncounter = function(ptId, encounter, callback) {
      return $http({
        url: '/db/encounters',
        method: 'POST',
        data: {
          ptId: ptId,
          //encounter object expects two values: bloodPressure and medicationsPrescribed
          encounter: encounter
        }
      });
    };
  }])

  .factory('substrate', ['$http', '$q', function($http, $q) {
    var apiPaths = {
      demographics: '/patient/demographics',
      vitals: '/encounter/vitals',
      labs: '/patient/labs'
    };

    var getPatientData = function(patientId, callback){

      var result = $q.all({
        demographics: getPatientDemographics(patientId),
        vitals: getVitals(patientId),
        lab: getLabs(patientId)
      });

      return result;
    };

    var getPatientDemographics = function(patientId) {
      console.log('getPatientDemographics is being run.');
      return $http({
        url: apiPaths.demographics,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    var getLabs = function(patientId) {
      console.log('getLabs is being run.');
      return $http({
        url: apiPaths.labs,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    var getVitals = function(patientId) {
      console.log('getVitals is being run.');
      return $http({
        url: apiPaths.vitals,
        method: 'POST',
        data: {
          'Value': patientId,
          'Type': 'MRN'
        }
      });
    };

    return {
      getPatientData: getPatientData,
      patientData: {}
    };
  }])

  .factory('pt', ['startup', function(startup) {
    console.log(startup);

    return {
      race: startup.ptData.substrate.demographics.data.Race.Text,
      age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      currentBP: {
        Systolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Systolic.Value, 10),
        Diastolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Diastolic.Value, 10)
      },
      hasDiabetes: true,
      isOnMedication: true,
      hasCKD: true,
      medication: [{
        name: 'Advil',
        dose: 10,
        maxDose: 50,
        unit: 'mg'
      }],
      targetBP: '',
      races: ['Black or African American', 'Asian', 'Caucasian'],
      hasBPGoal: function(){
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
    };
  }])

  .service('graphHelpers', [function() {

    this.getBPExtreme = function(array, keyName) {
      var numArray = [];

      for(var i = 0; i < array.length; i++) {
        numArray.push(array[i].blood_pressure[keyName]);
      }

      if(keyName === 'systolic') {
        return Math.max.apply(Math, numArray);
      } else if (keyName === 'diastolic') {
        return Math.min.apply(Math, numArray);
      } else {
        throw new Error("getBPExtreme requires either 'systolic' or 'diastolic' as a key name.");
      }
    };

    this.parseBPData = function(bpDataArr, targetBP) {
      var results = [];
      var targetSys = 120;
      var targetDias = 80;

      for(var i = 0; i < bpDataArr.length; i++) {
        var bp = JSON.parse(bpDataArr[i].blood_pressure);
        var date = new Date(bpDataArr[i].encounter_date);

        results.push({
          date: date,
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          targetDias: targetDias,
          targetSys: targetSys
        });
      }
      return results;
    };

    this.parseArray = function(array) {
      var results = [];
      for(var i = 0; i < array.length; i++) {
        var obj = array[i];
        for(var key in obj) {
          if(typeof obj[key] === "string") {
            try{
              obj[key] = JSON.parse(obj[key]);
            }
            catch (e) {
              obj[key] = new Date(obj[key]);
            }
          }
        }
        results.push(array[i]);
      }
      return results;
    };

  }])

  .factory('algorithm', ['pt', function(pt) {
    //returns recommendation string and status
    //3 possible statuses: 'bad', 'ok', 'good'

    var recMessages = {
      continueTreatment: "Continue current treatment and monitoring.",
      firstVisit: {
        nonBlackNoCKD: "Initiate thiazide-type diuretic or ACEI or ARB or CCB, alone or in combination. ACEIs and ARBs should not be used in combination.",
        blackNoCKD: "Initiate thiazide-type diuretic or CCB, alone or in combination.",
        CKD: "Initiate ACEI or ARB, alone or in combination with other drug class. ACEIs and ARBs should not be used in combination."
      },
      titrationStrategies: {
        a: "Maximize first medication before adding second.",
        b: "Add second medication before reaching maximum dose of first medication.",
        c: "Start with two medication classes, separately or as fixed-dose combination."
      },
      allFollowUpVisits: "Reinforce medication and lifestyle adherence.",
      secondVisit: {
        ab: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
        c: "Titrate doses of initial medication to maximum."
      },
      thirdVisit: "Add and titrate thiazide-type diuretic or ACEI or ARB or CCB (use medication class not previously selected and avoid combined use of ACEI and ARB).",
      fourthVisit: "Add additional medication class(eg, &#914;-blocker, aldosterone antagonist, or others) and/or refer to physician with expertise in hypertension management."
    };

    //for the moment, return a stub object:
    return {
      targetBP: {
        systolic: 120,
        diastolic: 80
      },
      recommendation: recMessages.firstVisit.blackNoCKD
    };

    var recommendation = {
      status: '',
      message: ''
    };

    var generateRec = function() {
      if(pt.hasBPGoal()){
        if(pt.isAtBPGoal()){
            // meeting goal -- move to data viz to reinforce success and show BP graphs
          return {};
        } else { // not at BP goals
          console.log("Not at BP goals.");
        }
      } else {
        if(pt.age >= 18) {
          // set targetBP by age and diabetes/CKD logic
          if(!pt.hasDiabetes && !pt.hasCKD) {
            if(pt.age >= 60) {
              pt.targetBP = [150, 90];
            } else if (pt.age < 60) {
              pt.targetBP = [140, 90];
            }
          } else if(pt.hasDiabetes || pt.hasCKD) {
            if(pt.hasDiabetes && !pt.hasCKD) {
              pt.targetBP = [140, 90];
            } else if (pt.hasCKD) {
              pt.targetBP = [140, 90];
            }
          }
        } else {
          // TODO: Patient is under 18.
          console.warn("Patient is under 18.");
        }

        if(pt.isAtBPGoal()) {
          recommendation.message = recMessages.continueTreatment;
          return recommendation;
        }

        if(!pt.hasCKD) {
          if(pt.race !== "Black or African American") {
            // TODO: pt.selectDrugTreatmentStrategy();
            recommendation.message = recMessages.firstVisit.nonBlackNoCKD;
            return recommendation;
          } else if(pt.race === "Black or African American") {
            recommendation.message = recMessages.firstVisit.blackNoCKD;
            return recommendation;
          }
        } else if(pt.hasCKD) {
          recommendation.message = recMessages.firstVisit.CKD;
          return recommendation;
        }
      }
    };

    // collect additional information where needed

    console.warn("Reached the bottom of the algorithm logic; this shouldn't happen.");
  }])

  .directive('bpGraph', ['graphHelpers', function(graphHelpers) {
      
      var renderGraph = function(scope) {
        var dimArr = [600, 400];
        var data = graphHelpers.parseArray(scope.data.ptData.db);

        var margins = [30, 30, 30, 60];
        var width = dimArr[0] - margins[1] - margins[3];
        var height = dimArr[1] - margins[0] - margins[2];

        // set up the axes based on the data. will need to adjust where it grabs min/max
        // may need to scale d3.time.day.offset to d3.time.month.offset or similar, depending on range of dates
        var x = d3.time.scale()
            .domain([data[0].encounter_date, d3.time.day.offset(data[data.length-1].encounter_date, 1)])
            .range([0, width]);

        var y = d3.scale.linear().domain([
            graphHelpers.getBPExtreme(data, 'diastolic')-10,
            graphHelpers.getBPExtreme(data, 'systolic')+10
          ]).range([height, 0]);

        var diasLine = d3.svg.line()
          .x(function(d,i) {
            // using/returning time to fake time spacing on our database data
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            return y(d.blood_pressure.diastolic);
        });

        var sysLine = d3.svg.line()
          .x(function(d,i) {
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            return y(d.blood_pressure.systolic);
        });

        var diasTargetLine = d3.svg.line()
          .x(function(d,i) {
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            console.log(scope);
            console.log(scope.targetDias);
            return y(scope.targetDias);
        });

        var sysTargetLine = d3.svg.line()
          .x(function(d,i) {
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            return y(scope.targetSys);
        });

          // add the SVG element
        var graph = d3.select('#bp-graph').append('svg:svg')
          .attr('width', width + margins[1] + margins[3])
          .attr('height', height + margins[0] + margins[2])
          .attr('style', 'position:absolute; top: 0; left: 0')
        .append('svg:g')
          .attr('transform', 'translate(' + margins[3] + ',' + margins[1] + ')')
          .attr('width', width)
          .attr('height', height);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(d3.time.days, 1)
            .tickFormat(d3.time.format('%m/%d/%y'))
            .tickSize(4)
            .tickPadding(5);

        //add the x axis...
        graph.append('svg:g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        var yAxisLeft = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickPadding(8);

        // add the y-axis to the left
        graph.append('svg:g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(0,0)')
          .call(yAxisLeft);

        graph.append('svg:path').attr('d', diasLine(data)).attr('class', 'plotline diasLine').attr('transform','translate(40,0)');
        graph.append('svg:path').attr('d', sysLine(data)).attr('class', 'plotline sysLine').attr('transform','translate(40,0)');
        graph.append('svg:path').attr('d', diasTargetLine(data)).attr('class', 'plotline diasLine targetLine').attr('transform','translate(40,0)');
        graph.append('svg:path').attr('d', sysTargetLine(data)).attr('class', 'plotline sysLine targetLine').attr('transform','translate(40,0)');
    };

    var removeFirstGraphChild = function() {
      var graph = document.getElementById('bp-graph');
      if(graph.children.length > 1){
        graph.removeChild(graph.firstChild);
      }
    };

    return {
      restrict: 'AE',
      template: '<div id="bp-graph" class="graph" style="position: relative"></div>',
      scope: {
        data: '=data',
        targetSys: '=targetSys',
        targetDias: '=targetDias'
      },
      link: function (scope, element, attrs) {
        scope.$watch('targetSys', function(newVal, oldVal) {
          console.log('targetSys changed.');
          renderGraph(scope);
          removeFirstGraphChild();
        });

        scope.$watch('targetDias', function(newVal, oldVal) {
          console.log('targetDias changed.');
          renderGraph(scope);
          removeFirstGraphChild();
        });

      }
    }
  }])
  ;
