function renderMDSDataPlot(mds_chart_data){
    console.log("Rendering MDS Data Plot with K = ", selected_k)

    mdsdata = mds_chart_data.mds_data
    var cluster_id = mds_chart_data.cluster_id;
    var clusters = Array.from(new Set(cluster_id))

    var svgWidth = 700;
    var svgHeight = 350;
    var margin = { top: 20, right:20, bottom: 60, left: 60 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    d3.select("#mds-data-plot-container").selectAll("*").remove();

    var svg = d3.select("#mds-data-plot-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set scales for x and y axes
    var xScale = d3.scaleLinear()
        .domain(d3.extent(mdsdata, d => d.Comp1)) // Assuming Comp1 is the first MDS component
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(mdsdata, d => d.Comp2)) // Assuming Comp2 is the second MDS component
        .range([height, 0]);


    mdsdata.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.cluster_id = cluster_id[mdsdata.indexOf(d)]
    });

    const colorScale = d3.scaleOrdinal()
        .domain(clusters) // Assuming species attribute is present in your data
        .range(d3.schemeCategory10);

    mdsdata.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.color = colorScale(d.cluster_id);
    });

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .style("color", "white")
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    svg.append('g')
        .call(d3.axisLeft(yScale).tickSizeOuter(0))
        .style("color", "white")
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text("Component 1");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "white")
        .style("font-weight", "bold")
        .text("Component 2");

    // Draw data points
    svg.selectAll("circle")
        .data(mdsdata)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Comp1)) // Assuming Comp1 is the first MDS component
        .attr("cy", d => yScale(d.Comp2)) // Assuming Comp2 is the second MDS component
        .attr("r", 2)
        .style("fill", "steelblue")
        .style('fill', d => d.color);
}

  

