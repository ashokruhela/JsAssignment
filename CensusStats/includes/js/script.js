
//global variables - need to change from bootstrap width & height
var margin = {top: 20, bottom: 200, left: 50, right: 20},
   width = 960 - margin.left - margin.right,
   height = 700 - margin.top - margin.bottom;

var barWidth = 20;

var x0 = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.ordinal()
   .range(["red", "blue", "#98abc5", "#8a89a6", "#7b6888", "#d0743c", "#ff8c00"]);

  //  Set up the xAxis to use our x0 scale and be oriented on the bottom.
var xAxis = d3.svg.axis()
   .scale(x0)
   .orient("bottom");

var yAxis = d3.svg.axis()
   .scale(y)
   .orient("left")
   .tickFormat(d3.format(".2s"));



//svg.call(tip);
d3.json("http://localhost:8080/JsAssignment/CensusStats/data/all.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;
    //console.log(json);
    plotTotalPopulationGraph(json, ".all");
  });

d3.json("http://localhost:8080/JsAssignment/CensusStats/data/state.json", function(error, json) {
   if (error) return console.warn(error);
   data = json;
   //console.log(json);
   plotStateGraph(json, ".chart");
 });

 d3.json("http://localhost:8080/JsAssignment/CensusStats/data/northEast.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;
    //console.log(json);
    plotStateGraph(json, ".northEast");
  });

 function plotStateGraph(data, containerName) {

    var svg = d3.select(containerName).append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //These are things for which bar to be drawn like male and female
    var seriesNames = d3.keys(data[0]).filter(function (key) {
        return (key != "state");
     });

     //gets the count for indiviudal data. ex male count and female count
     data.forEach(function (d) {
       d.count = seriesNames.map(function (name) { return { name: name, value: +d[name] }; });
     });

     x0.domain(data.map(function (d) { return d.state; }));
     x1.domain(seriesNames).rangeRoundBands([0, x0.rangeBand()]);

     var maxPopulation = d3.max([d3.max(data, function(d) { return d.LiterateMale}),
        d3.max(data, function(d) { return d.LiterateFemale}), d3.max(data, function(d) { return d.IlliterateMale}),
        d3.max(data, function(d) { return d.IlliterateFemale})]);
     y.domain([0, 10 + maxPopulation]);

     svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
       .selectAll('text')
       .attr("transform", "rotate(-65)")
       .style("text-anchor", "end");

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Population");

    var state = svg.selectAll(".state")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function (d) { return "translate(" + x0(d.state) + ", 0)"; });

    state.selectAll("rect")
       .data(function (d) { return d.count; })
       .enter().append("rect")
       .attr("width", x1.rangeBand())
       .attr("x", function (d) { return x1(d.name); })
       .attr("y", function (d) { return y(d.value); })
       .attr("height", function (d) { return height - y(d.value); })
       .style("fill", function (d) { return color(d.name); });
      //  .on('mouseover', tip.show)
      //  .on('mouseout', tip.hide);

      state.selectAll("rect")
		.on("mouseover", function(d){
         var xPos = parseFloat(d3.select(this).attr("x"));
         var yPos = parseFloat(d3.select(this).attr("y"));
         var height = parseFloat(d3.select(this).attr("height"))

         d3.select(this).attr("stroke","green").attr("stroke-width",3);
         console.log(d.value);
         console.log("x: " + xPos + ", y: "+ yPos + ", height: "+ height/2);
         svg.append("text")
            .attr("x", xPos)
            .attr("y",yPos + height/2)
            .attr("class","tooltip")
            .text(d.value);
		})
		.on("mouseout",function(){
			svg.select(".tooltip").remove();
			d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);

		})

    var legend = svg.selectAll(".legend")
       .data(seriesNames.slice())
       .enter().append("g")
       .attr("class", "legend")
       .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
       .attr("x", width - 200)
       .attr("width", 18)
       .attr("height", 18)
       .style("fill", color);

    legend.append("text")
       .attr("x", width - 206)
       .attr("y", 9)
       .attr("dy", ".35em")
       .style("text-anchor", "end")
       .text(function (d) { return d; })
 }

function plotTotalPopulationGraph(data, containerName) {

   //Convert the data into an array
   var pieData = [];
   data.forEach(function(d){
      for(key in d) {
         pieData.push({
            'label': key,
            'value': d[key]
         });
      }
   })

   var radius = height/2;

   //using d3 built-in color scale
   var color = d3.scale.ordinal().range(["#462066", "#FFB85F", "#FF7A5A", "#00AAA0"]);

   //var color = d3.scale.category20b();

   var svg = d3.select(containerName).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append('g')
      .attr("transform", "translate(" + (radius * 2) + "," + radius + ")");

   // declare an arc generator function
   var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(0);

   var pie = d3.layout.pie()
      .value(function(d) {return d.value});


   var arcs = svg.selectAll('.arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr("class", "arc");

   arcs.append("path")
      .attr("d", arc)
      .attr("fill", function(d) { return color(d.value);});

   var total = 0;
   total += d3.sum(data,function(d) { return parseInt(d.IlliterateMale) + parseInt(d.LiterateFemale) +
            parseInt(d.LiterateMale) + parseInt(d.LiterateFemale); });

   arcs.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"})
      .attr("class","pieText")
      .attr("text-anchor", "middle")
      .text(function(d) {
         //make lable with percentage
         var percent = d3.format("%");
         var pValue = percent(d.data.value/total);
          return pValue.toString();
       });

      var names = [];
      for(j =0;j<pieData.length;j++){
         names.push(pieData[j].label);
      }
      console.log(names);
       //adding legends
       var legend = svg.selectAll(".legend")
          .data(names)
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

       legend.append("rect")
          .attr("x", 400)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

       legend.append("text")
          .attr("x", 390)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function (d) { return d; })

}
