'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
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
        
        graph.append('line')
        	.attr('x1', 0)
        	.attr('y1', function() { return y(scope.targetDias); })
        	.attr('x2', width)
        	.attr('y2', function() { return y(scope.targetDias); })
        	.attr('class', 'plotline diasLine targetLine');

        graph.append('line')
        	.attr('x1', 0)
        	.attr('y1', function() { return y(scope.targetSys); })
        	.attr('x2', width)
        	.attr('y2', function() { return y(scope.targetSys); })
        	.attr('class', 'plotline sysLine targetLine');


        // graph.append('svg:path').attr('d', sysTargetLine(data)).attr('class', 'plotline sysLine targetLine').attr('transform','translate(40,0)');
    };


    // var diasTargetLine = d3.svg.line()
    //   .x(function(d,i) {
    //     return x(new Date(d.encounter_date));
    //   })
    //   .y(function(d, i) {
    //     return y(scope.targetDias);
    // });

    // var sysTargetLine = d3.svg.line()
    //   .x(function(d,i) {
    //     return x(new Date(d.encounter_date));
    //   })
    //   .y(function(d, i) {
    //     return y(scope.targetSys);
    // });





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
