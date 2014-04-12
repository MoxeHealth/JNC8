'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('drugPricing', ['goodRx', 'pt', function(goodRx, pt) {

    var generateEmailLink = function(email, drugObj){
      var mailtoString = 'mailto:';

      // append the patient's email
      if(email.length) {
        mailtoString += email[0].EmailAddress + '?';
      } else {
        mailtoString += '?';
      }

      if(email.length > 1) {
        mailtoString += 'cc=' + email[1].EmailAddress + '&';
      }

      mailtoString += 'subject=Pricing information for ' + drugObj.display + '&';

      // set the email body
      mailtoString += 'body=Please find the pricing details for ' + drugObj.display + ' at this site: ' + drugObj.url;


      return mailtoString;
    };


    return {
      template: '<div>'+
      '<div class="med-name" ng-init="showDetails=false" ng-click="showDetails = !showDetails">{{medName}}' + 
            '<div class="inline-info price right">{{ price | currency }}</div>' + 
          '</div>' + 
          '<div class="med-details cf" ng-show="showDetails">' +
              '<div class="inline-info left"><span class="med-detail">' +
                '<span class="label">Dosage:</span> {{ dosage }}' +
              '</span>' +
              '<span class="med-detail"><span class="label">Units:</span> {{ units }}</span></div>' +
              '<div class="inline-info right"><span class="med-detail"><a href="{{ drugInfo.url }}" target="_blank">More pricing information</a></span>' +
              '<span class="med-detail"><a href="{{emailLink}}" title="Email pricing information for {{medName}}" target="_blank">Email pricing details</a></span></div>' +
          '</div></div>',
      replace: true,
      restrict: 'EA',
      scope: {
        medName: '=med',
      },
      link: function(scope, element, attrs) {
        // get the pricing for this drug
        goodRx.getPricing(scope.medName, function(res) {
          scope.price = res.data.price[0];
          scope.drugInfo = res.data;
          scope.dosage = res.data.dosage;
          scope.units = res.data.quantity;
          scope.emailLink = generateEmailLink(pt.email, scope.drugInfo);
        });
      }
    }

  }])

  .directive('bpGraph', ['graphHelpers', function(graphHelpers) {
      
      var renderGraph = function(scope) {
        console.log('scope', scope);

        // set the width/height of the graph based on the size of the containing element
        // var elWidth = document.getElementsByTagName('bp-graph')[0].clientWidth;
        var elWidth = 350;

        //handle case when patient has no entries in database 
        // console.log(scope.data.ptData.db);
       if(!scope.data.ptData.db.length){ return; }

        var data = graphHelpers.parseArray(scope.data.ptData.db);

        var margins = [30, 30, 30, 40];
        var width = elWidth - margins[1];
        var height = (elWidth/1.5) - margins[0] - margins[2];

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
