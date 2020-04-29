const EDUCATION_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
var path = d3.geoPath();

var width = 1000,
height = 1000,
padding = {
  left: 150,
  right: 150,
  bottom: 500,
  top: 50 };


var tooltip = d3.select("body").
append("div").
attr("id", "tooltip").
style("opacity", 0);

var section = d3.select("body").
append("section");

//heading
var heading = section.append("heading");
heading.append("h1").
attr('id', 'title').
text("United States College Graduates");
heading.append("h4").
attr('id', 'description').
html("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014).");


var svg = d3.select('body').
append('svg').
attr('width', width + padding.left + padding.right).
attr('height', height + padding.top + padding.bottom);


var x = d3.scaleLinear().
domain([2.6, 75.1]).
rangeRound([600, 860]);

var color = d3.scaleThreshold().
domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8)).
range(d3.schemeBlues[9]);

var legend = svg.append("g").
attr("class", "key").
attr("id", "legend").
attr("transform", "translate(0,40)");

legend.selectAll("rect").
data(color.range().map(function (d) {
  d = color.invertExtent(d);
  if (d[0] == null) d[0] = x.domain()[0];
  if (d[1] == null) d[1] = x.domain()[1];
  return d;
})).
enter().append("rect").
attr("height", 8).
attr("x", function (d) {return x(d[0]);}).
attr("width", function (d) {return x(d[1]) - x(d[0]);}).
attr("fill", function (d) {return color(d[0]);});

legend.append("text").
attr("class", "caption").
attr("x", x.range()[0]).
attr("y", 0).
attr("fill", "#000").
attr("text-anchor", "start").
attr("font-weight", "bold");

legend.call(d3.axisBottom(x).
tickSize(13).
tickFormat(function (x) {return Math.round(x) + '%';}).
tickValues(color.domain()));







var files = [EDUCATION_FILE, COUNTY_FILE];
var promises = [];

files.forEach(function (url) {
  promises.push(d3.json(url));
});

Promise.all(promises).then(function (values) {
  svg.append("g").
  attr('transform', 'translate(' + padding.left + ',' + padding.top + ')').
  attr("class", "counties").
  selectAll("path").
  data(topojson.feature(values[1], values[1].objects.counties).features).
  enter().append("path").
  attr("class", "county").
  attr("data-fips", function (d) {
    return d.id;
  }).
  attr("data-education", function (d) {
    var result = values[0].filter(function (obj) {
      return obj.fips == d.id;
    });


    if (result[0]) {
      return result[0].bachelorsOrHigher;
    }
    //could not find a matching fips id in the data
    console.log('could find data for: ', d.id);
    return 0;
  }).
  attr("fill", function (d) {
    var result = values[0].filter(function (obj) {
      return obj.fips == d.id;
    });
    if (result[0]) {
      return color(result[0].bachelorsOrHigher);
    }
    //could not find a matching fips id in the data
    return color(0);
  }).
  attr("d", path).
  on("mouseover", function (d) {
    tooltip.style("opacity", .9);
    tooltip.html(function () {
      var result = values[0].filter(function (obj) {
        return obj.fips == d.id;
      });
      if (result[0]) {
        return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%';
      }
      //could not find a matching fips id in the data
      return 0;
    }).
    attr("data-education", function () {
      var result = values[0].filter(function (obj) {
        return obj.fips == d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      //could not find a matching fips id in the data
      return 0;
    }).
    style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY - 28 + "px");
  }).
  on("mouseout", function (d) {
    tooltip.style("opacity", 0);
  });

  svg.append("path").
  datum(topojson.mesh(values[1], values[1].objects.states, function (a, b) {return a !== b;})).
  attr("class", "states").
  attr("d", path);



});