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
      console.log('into getPatientData');

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

  //todo - refactor so that pt calls the 'startup' service only once, not 2x. Currently pt passed into both dataVizCtrl and dataEntryCtrl
  .factory('pt', ['startup', function(startup) {
    console.log('pt factory called');
    console.log(startup);

    var isFirstVisit = function(){
      var result = startup.ptData.db.length === 0;
      console.log('isFirstVisit', result);
      return startup.ptData.db.length === 0;
    }

    return {
      race: startup.ptData.substrate.demographics.data.Race.Text,
      // age: parseInt(startup.ptData.substrate.demographics.data.Age.substring(0,startup.ptData.substrate.demographics.data.Age.length-1), 10),
      age: 70,
      currentBP: {
        Systolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Systolic.Value, 10),
        Diastolic: parseInt(startup.ptData.substrate.vitals.data.BloodPressure.Diastolic.Value, 10)
      },
      //todo - write this function
      // currentMeds: getCurrentMeds(startup.ptData.db);
      //stub for now
      // currentMeds: [{'ACEI': 'lisinopril', atMax: true}],
      // hasDiabetes: false,
      isOnMedication: true,

      //todo - is there ever a scenario in which a doctor would enter patient data into the db, but not prescribe a medication? if so, we can use isFirstVisit. Otherwise, use currentMeds.length (currently using currentMeds.length property) to determine algorithm flow. 
      isFirstVisit: isFirstVisit(),
      hasCKD: true,
      races: ['Black or African American', 'Asian', 'Caucasian'],
      //todo - populate this variable from the database
      // targetBP: startup.ptData.db[db.length - 1].targetBP;
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

    //currently assuming that every encounter in the database
    //will have a value in the blood_pressure field and an encounter_date field
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
