function renderBiPlot(data) {

    biplotData = data.biplot_data;
    var cluster_id = biplotData.cluster_id;
    var clusters = Array.from(new Set(cluster_id))

    biplotData.pca_scores.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.cluster_id = cluster_id[biplotData.pca_scores.indexOf(d)]
    });

    const colorScale = d3.scaleOrdinal()
        .domain(clusters) // Assuming species attribute is present in your data
        .range(d3.schemeCategory10);

    biplotData.pca_scores.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.color = colorScale(d.cluster_id);
    });

    // Clear any existing SVG to make room for the biplot
    d3.select("#bi-plot-container").selectAll("*").remove();

    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 40, left: 50 },
          width = 760 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Get the full extent of the data including negative values
    const xExtent = d3.extent([...biplotData.pca_scores.map(d => d[0]), ...biplotData.pca_loadings.flat()]);
    const yExtent = d3.extent([...biplotData.pca_scores.map(d => d[1]), ...biplotData.pca_loadings.flat()]);

    // Update the scales
    const xScale = d3.scaleLinear()
                     .domain(xExtent)
                     .range([0, width]);
    const yScale = d3.scaleLinear()
                     .domain(yExtent)
                     .range([height, 0]);


    // Adjust SVG width and ViewBox
    const svg = d3.select("#bi-plot-container")
              .append("svg")
              .attr("width", '100%') // Set SVG width to 100% of the parent container
              .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

    // Translate the axes to the center
    svg.append("g")
       .attr("transform", `translate(0,${yScale(0)})`) // Translate to vertical center
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("transform", `translate(${xScale(0)},0)`) // Translate to horizontal center
       .call(d3.axisLeft(yScale));
    
    // Create the tooltip div as a hidden element in the body
    const tooltipDiv = d3.select("body").append("div")
                          .attr("id", "tooltip")
                          .style("opacity", 0)
                          .style("position", "absolute")
                          .style("display", "none"); // Start hidden, CSS will control the rest

    // Later on, when you create the dots:
    const dots = svg.selectAll(".dot")
                     .data(biplotData.pca_scores)
                     .enter()
                     .append("circle")
                     .attr("data-index", (d, i) => i)
                     .attr("class", "dot")
                     .attr("cx", d => xScale(d[0]))
                     .attr("cy", d => yScale(d[1]))
                     .attr("r", 2)
                     .style("fill", d => d.color);

    const scalingFactor = 10;
    // Draw loading vectors for each feature
    biplotData.feature_names.forEach((feature, i) => {
        const loading = biplotData.pca_loadings.map(d => d[i]); // Get the ith loading from each PC
        //const maxLoadingValue = Math.max(...loading.map(l => Math.abs(l))); // Find the max loading value for scaling
                
        svg.append("line")
           .attr("x1", xScale(0))
           .attr("y1", yScale(0))
           .attr("x2", xScale(loading[0] * scalingFactor)) // Scale and center the loading vector
           .attr("y2", yScale(loading[1] * scalingFactor)) // Scale and center the loading vector
           .style("stroke", "red")
           .style("stroke-width", 2);


        svg.append("rect")
           .attr("x", xScale(loading[0] * scalingFactor))
           .attr("y", yScale(loading[1] * scalingFactor) - 12) // Adjust position based on font size
           .attr("width", feature.length * 6) // Approximate width based on characters
           .attr("height", 16) // Adjust height based on font size
           .style("fill", "rgba(255, 255, 255, 0.9)");
                
        svg.append("text")
           .attr("x", xScale(loading[0] * scalingFactor))
           .attr("y", yScale(loading[1] * scalingFactor))
           .text(feature)
           .style("text-anchor", "start")
           .style("fill", "black")
           .style("font-size", "12px");

        
    });                

    
    // Add mouseover and mouseout events to the dots
    dots.on("mouseover", function(event, d) {
        const index = d3.select(this).attr("data-index"); // Get the index from the data attribute
        tooltipDiv.transition()
                  .duration(200)
                  .style("opacity", .9)
                  .style("display", "block"); // Show the tooltip

        tooltipDiv.html(biplotData.observation_names[index]) // Get the name using the index
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 10) + "px"); // Position the tooltip above the cursor
    })
    .on("mouseout", function() {
        tooltipDiv.transition()
                  .duration(500)
                  .style("opacity", 0)
                  .style("display", "none"); // Hide the tooltip after mouseout
    });                
       

}