function renderPCPlot(pcpdata){

    data = pcpdata.pcp_data
    var keys = Object.keys(data[0]);
    
    var svgWidth = 1400;
    var svgHeight = 750;
    var margin = { top: 20, right: 20, bottom: 60, left: 60 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('#pc-plot-container')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

     // Define scales
     var x = d3.scalePoint().range([0, width]).padding(1),
     y = {};

    keys.forEach(function(key) {
        y[key] = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d[key]; }))
            .range([height, 0]);
    });

    // Draw lines
    var line = d3.line()
        .defined(function(d) { return !isNaN(d[1]); })
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y[d[1]](d[0]); });

    x.domain(dimensions = keys.filter(function(d) {
        return d != 'name' && (y[d].domain(d3.extent(data, function(p) { return p[d]; })), true);
    }));

    svg.selectAll('myPath')
        .data(data)
        .enter().append('path')
        .attr('d', function(d) { return line(dimensions.map(function(dim) { return [x(dim), y[dim](d[dim])]; })); })
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .style('stroke-width', '2px');

}