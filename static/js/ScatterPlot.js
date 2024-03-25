function renderScatterPlotMatrix(scatter_plot_data) {

    console.log("Rendering Scatter Plot");

    var data = scatter_plot_data.scatterplot_data;
    var columns = scatter_plot_data.top4_attributes;
    var cluster_id = scatter_plot_data.cluster_id;
    var clusters = Array.from(new Set(cluster_id))

    data.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.cluster_id = cluster_id[data.indexOf(d)]
    });

    console.log(data)
    const colorScale = d3.scaleOrdinal()
        .domain(clusters) // Assuming species attribute is present in your data
        .range(d3.schemeCategory10);

    data.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.color = colorScale(d.cluster_id);
    });

    var svgWidth = 650;
    var svgHeight = 650;
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Calculate dimensions for each plot
    var plotWidth = 10 + (width - (columns.length - 1) * 10) / columns.length;
    var plotHeight = 10 + (height - (columns.length - 1) * 10) / columns.length;

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
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
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

            if (i === j) {
                // Diagonal plots: Add dots and text
                plot.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return xScale(d[columns[i]]); })
                    .attr('cy', function(d) { return yScale(d[columns[j]]); })
                    .attr('r', 1.5)
                    .style("fill", d => d.color)
                    .style('fill-opacity', 0.0);

                plot.append('text')
                    .attr('x', plotWidth / 2)
                    .attr('y', plotHeight / 2)
                    .attr('dy', '0.35em')
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold') // Increase font boldness
                    .style('font-size', '16px')
                    .text(columns[i]);
            } else {
                // Non-diagonal plots: Add only dots
                plot.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) { return xScale(d[columns[i]]); })
                    .attr('cy', function(d) { return yScale(d[columns[j]]); })
                    .attr('r', 1.5)
                    .style('fill', d => d.color);
            }
        }
    }
}

function renderAttributeTable(data) {
    console.log("Rendering Attribute Table");


    const top4_attributes = data.scatter_plot_data.top4_attributes;
    const sum_sq_loadings = data.sos_loadings;

    const tableContainer = d3.select('#attribute-table');

    const table = tableContainer.append('table')
                                .attr('class', 'table table-bordered table-striped')
                                .style('margin-top', '20px');


    const thead = table.append('thead');
    const headerRow = thead.append('tr');
    headerRow.append('th').text('Attribute');
    headerRow.append('th').text('Sum Of Squared Loadings');

    const tbody = table.append('tbody');
    
    top4_attributes.forEach((attr, index) => {
        let row = tbody.append('tr');
        row.append('td').text(attr);
        row.append('td').text(sum_sq_loadings[index].toFixed(4));
    })
}



