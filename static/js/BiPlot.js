
function renderBiPlot(data) {
    // Clear any existing SVG to make room for the biplot
    d3.select("#bi-plot-container").selectAll("*").remove();
    var pcaLoadings = data.pca_loadings;
    var pcaScores = data.pca_scores;
    var features = data.features;
    var cluster_id = data.cluster_id;

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 90},
          width = 560 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Append the svg object to the div called 'biplot-container'
    const svg = d3.select("#bi-plot-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        
    // Create scales for the biplot
    const xScale = d3.scaleLinear()
        .domain(d3.extent(pcaScores.map(d => d[0])))
        .range([0, width]);
    const yScale = d3.scaleLinear()
        .domain(d3.extent(pcaScores.map(d => d[1])))
        .range([height, 0]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // X axis label
    svg.append("text")
   .attr("text-anchor", "end")
   .attr("x", width / 2 + margin.left)
   .attr("y", height + margin.top + 20)
   .text("PC1");

   // Y axis label
   svg.append("text")
   .attr("text-anchor", "end")
   .attr("transform", "rotate(-90)")
   .attr("y", -margin.left + 20)
   .attr("x", -margin.top - height / 2 + 20)
   .text("PC2");

    // Plot the scores as circles
    svg.selectAll(".point")
        .data(pcaScores)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .attr("r", 2)
        .style("fill", "blue");

    // Define a line generator for the loading vectors
    const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]));
    
    //console.log(pcaData.loadings);
    // Plot the loading vectors
    svg.selectAll(".loading")
    .data(pcaLoadings)
    .enter().append("path")
    .attr("class", "loading")
    .attr("d", d => line([[0, 0], [d[0] * 8, d[1] * 8]])) // Adjust multiplier as needed
    .style("stroke", "red")
    .style("fill", "none");

    // Add labels to the loading vectors
    svg.selectAll(".loading-label")
    .data(pcaLoadings)
    .enter().append("text")
    .attr("class", "loading-label")
    .attr("x", d => xScale(d[0] * 8))  // Adjust multiplier as needed
    .attr("y", d => yScale(d[1] * 8))  // Adjust multiplier as needed
    .attr("dx", 5) // Offset the text a bit from the end of the vector
    .attr("dy", 5)
    .style("font-weight", "bold")
    .text((d, i) => features[i]);

}