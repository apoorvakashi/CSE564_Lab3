function renderScatterPlotMatrix(scatter_plot_data) {

    console.log("Rendering Scatter Plot");

    var data = scatter_plot_data.scatterplot_data;
    var columns = scatter_plot_data.top4_attributes;
    var cluster_id = scatter_plot_data.cluster_id;

    var svgWidth = 600;
    var svgHeight = 600;
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Calculate dimensions for each plot
    var plotWidth = (width - (columns.length - 1) * 10) / columns.length;
    var plotHeight = (height - (columns.length - 1) * 10) / columns.length;

    // Create scales
    var xScale = d3.scaleLinear()
                    .range([0, plotWidth])
                    .domain([0, d3.max(data, function(d) { return d3.max(columns, function(col) { return d[col]; }); })]);

    var yScale = d3.scaleLinear()
                    .range([plotHeight, 0])
                    .domain([0, d3.max(data, function(d) { return d3.max(columns, function(col) { return d[col]; }); })]);

    // Create SVG element
    var svg = d3.select('#scatter-plot-container')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);

    // Create plots
    for (var i = 0; i < columns.length; i++) {
        for (var j = 0; j < columns.length; j++) {
            var plotX = i * (plotWidth + 10);
            var plotY = j * (plotHeight + 10);

            var plot = svg.append('g')
                            .attr('transform', 'translate(' + plotX + ',' + plotY + ')');

            // Add box around each plot
            plot.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', plotWidth)
                .attr('height', plotHeight)
                .style('fill', 'none')
                .style('stroke', '#000')
                .style('stroke-width', '1px');

            // // Add axis ticks and labels
            // if (i === columns.length - 1) {
            //     plot.append('g')
            //         .attr('transform', 'translate(' + plotWidth + ',0)')
            //         .call(d3.axisRight(yScale).ticks(4));
            // }
            // if (j === 0) {
            //     plot.append('g')
            //         .attr('transform', 'translate(0,' + plotHeight + ')')
            //         .call(d3.axisBottom(xScale).ticks(4));
            // }

            if (i === j) {
                // Diagonal plots: Add dots and text
                plot.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return xScale(d[columns[i]]); })
                    .attr('cy', function(d) { return yScale(d[columns[j]]); })
                    .attr('r', 1.5)
                    .style('fill', 'blue')
                    .style('fill-opacity', 0.0);

                plot.append('text')
                    .attr('x', plotWidth / 2)
                    .attr('y', plotHeight / 2)
                    .attr('dy', '0.35em')
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold') // Increase font boldness
                    .style('font-size', '16px')
                    .text(columns[i]);
                    // .each(function() { // Add background box
                    //     var bbox = this.getBBox();
                    //     plot.insert('rect', 'text')
                    //         .attr('x', bbox.x - 5)
                    //         .attr('y', bbox.y - 5)
                    //         .attr('width', bbox.width + 10)
                    //         .attr('height', bbox.height + 10)
                    //         .style('fill', 'red')
                    //         .style('fill-opacity', 0.2)
                    //         .lower();
                    // });
            } else {
                // Non-diagonal plots: Add only dots
                plot.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return xScale(d[columns[i]]); })
                    .attr('cy', function(d) { return yScale(d[columns[j]]); })
                    .attr('r', 1.5)
                    .style('fill', 'orange');
            }
        }
    }
}
    
