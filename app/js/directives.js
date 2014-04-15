'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('drugInput', [ function() {
    return {
      templateUrl: 'partials/drugInput.html',
      restrict: 'EA'
    }
  }])

  .directive('drugDetails', ['goodRx', 'pt', function(goodRx, pt) {

    var generateEmailsLink = function(emails, drugObj){
      var mailtoString = 'mailto:';

      // append the patient's emails
      if(emails.length) {
        mailtoString += emails[0].EmailAddress + '?';
        if(emails.length > 1) {
          mailtoString += 'cc=' + emails[1].EmailAddress + '&';
        }
      } else {
        mailtoString += '?';
      }

      // set the emails body
      mailtoString += 'subject=Pricing information for ' + drugObj.display + '&' + 'body=Please find the pricing details for ' + drugObj.display + ' at this site: ' + drugObj.url;

      return mailtoString;
    };

    //make sure the following bindings to the med model are up to date with the data structure defined in algorithm_jnc8 and meds_jnc8. Example:
    //{ className: 'ACEI', meds: [{medName: 'valsartan', initialDoseOpts: [5],targetDoseOpts: [20]: }]})
    return {
      templateUrl: 'partials/drugDetails.html',
      replace: true,
      restrict: 'EA',
      scope: {
        med: '=med',
        goodRxErr: '@'
      },
      link: function(scope, element, attrs) {
        // get the pricing for this drug
        // res properties 
        goodRx.getPricing(scope.med.medName, scope.med.initialDoseRecs, function(res) {
          if(!res.errors.length){
            if(res.data) {
              scope.price = res.data.price[0] || "No price found.";
            } else {
              scope.price = "No price found.";
            }
            scope.drugInfo = res.data;
            scope.dose = res.data.dose;
            scope.units = res.data.quantity;
            scope.emailsLink = generateEmailsLink(pt.emails, scope.drugInfo);
          } else {
            var searchedMedName = scope.med.medName;

            scope.med.medName = 'Medication lookup error: "' + searchedMedName + '" was not found on GoodRx\'s website.';

            if(res.errors[0].candidates.length) {
              scope.med.medName += ' Choose from these alternatives: ';
            } else {
              scope.med.medName += ' No alternatives were found.';
            }
            scope.goodRxAlts = res.errors[0].candidates;
            scope.goodRxErr = true;
          }
        });
      }
    }

  }])

  .directive('bpGraph', ['graphHelpers', function(graphHelpers) {
      
      var renderGraph = function(scope) {
        // set the width/height of the graph based on the size of the containing element
        // var elWidth = document.getElementsByTagName('bp-graph')[0].clientWidth;
        var elWidth = 350;

        //handle case when patient has no entries in database 
       if(!scope.data.ptData.db.length){ return; }

        var data = graphHelpers.parseGraphData(scope.data.ptData.db);

        var margins = [30, 30, 30, 40];
        var width = elWidth - margins[1];
        var height = (elWidth/1.5) - margins[0] - margins[2];

        // set up the axes based on the data. will need to adjust where it grabs min/max
        // may need to scale d3.time.day.offset to d3.time.month.offset or similar, depending on range of dates
        var x = d3.time.scale()
            .domain([data[0].encounter_date, d3.time.day.offset(data[data.length-1].encounter_date, 1)])
            .range([0, width]);

        var y = d3.scale.linear().domain([
            graphHelpers.getBPExtreme(data, 'Diastolic')-10,
            graphHelpers.getBPExtreme(data, 'Systolic')+10
          ]).range([height, 0]);

        var diasLine = d3.svg.line()
          .x(function(d,i) {
            // using/returning time to fake time spacing on our database data
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            return y(d.blood_pressure.Diastolic);
        });

        var sysLine = d3.svg.line()
          .x(function(d,i) {
            return x(new Date(d.encounter_date));
          })
          .y(function(d, i) {
            return y(d.blood_pressure.Systolic);
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
          // console.log('targetSys changed.');
          renderGraph(scope);
          removeFirstGraphChild();
        });

        scope.$watch('targetDias', function(newVal, oldVal) {
          // console.log('targetDias changed.');
          renderGraph(scope);
          removeFirstGraphChild();
        });

        // write a watch for the window size here. if it changes, re-render the SVG to match it

      }
    }
  }])
;
