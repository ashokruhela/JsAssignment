
//global variables - need to change from bootstrap width & height
var margin = {top: 20, bottom: 20, left: 20, right: 20},
   width = 960 - margin.left - margin.right,
   height = 500 - margin.top - margin.bottom;

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
   .orient("left");

var svg = d3.select(".chart").append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("http://localhost:8080/censusstats/data/all.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;
    //console.log(json);
    plotGraph(json);
  });

function plotGraph(data) {

   //These are things for which bar to be drawn like male and female
   var seriesNames = d3.keys(data[0]).filter(function (key) {
       return (key !== "education");
    });

    //gets the count for indiviudal data. ex male count and female count
    data.forEach(function (d) {
      d.count = seriesNames.map(function (name) { return { name: name, value: +d[name] }; });
    });

    x0.domain(data.map(function (d) { return d.education; }));
    x1.domain(seriesNames).rangeRoundBands([0, x0.rangeBand()]);

    var maxPopulation = d3.max([d3.max(data, function(d) { return d.male}), d3.max(data, function(d) { return d.female})]);
    y.domain([0, 10 + maxPopulation]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

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
     .attr("transform", function (d) { return "translate(" + x0(d.education) + ", 0)"; });

   state.selectAll("rect")
      .data(function (d) { return d.count; })
      .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function (d) { return x1(d.name); })
      .attr("y", function (d) { return y(d.value); })
      .attr("height", function (d) { return height - y(d.value); })
      .style("fill", function (d) { return color(d.name); });

   var legend = svg.selectAll(".legend")
      .data(seriesNames.slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

   legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

   legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) { return d; })
}
