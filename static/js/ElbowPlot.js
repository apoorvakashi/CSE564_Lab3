function renderElbowPlot(data){
    console.log("Rendering Elbow Plot with idi = ", selected_idi, "and K = ", selected_k)
    var kValues = data.K
    var distortions = data.distortions

    var svgWidth = 600;
    var svgHeight = 400;
    var margin = { top: 40, right: 40, bottom: 80, left: 80 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select("#elbow-plot-container")
                .append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

    // Create scales
    var xScale = d3.scaleLinear()
                    .domain([0, d3.max(kValues)])
                    .range([margin.left, width + margin.left]);

    var yScale = d3.scaleLinear()
                    .domain([d3.min(distortions)-1000, d3.max(distortions)+ 1000])
                    .range([height + margin.top, margin.top]);

    // Create line function
    var line = d3.line()
                    .x(function(d, i) { return xScale(kValues[i]); })
                    .y(function(d) { return yScale(d); });

    // Draw line
    svg.append("path")
        .datum(distortions)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .on("click", function(d, i) {
            // Handle click event
            // Add your logic to highlight the selected dot
        });

    // Draw dots
    svg.selectAll(".dot")
        .data(distortions)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d, i) { return xScale(kValues[i]); })
        .attr("cy", function(d) { return yScale(d); })
        .attr("r", function(d, i){
            return i == selected_k-1? 8:5
        })
        .attr("fill", function(d, i){
            return i == selected_k-1? "red":"orange"
        })
        .on("click", function(event, d) {

            svg.selectAll(".dot")
            .attr("r", 5)
            .attr("fill", "orange");

            // Highlight the selected dot
            d3.select(this)
            .attr("r", 8)
            .attr("fill", "red");
            // Update the text for selected K and Distortion values
            svg.select("#selected-k").text("K : " + String(distortions.indexOf(d) + 1) );
            svg.select("#selected-distortion").text("Distortion : " + String(d.toFixed(2)));

            fetchandRenderScatterPlot();
            fetchandRenderBiPlot();
        });

    // Add x axis
    svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .call(d3.axisBottom(xScale));

    // Add y axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 50)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("K value");
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - margin.top)
        .attr("y", margin.left - 60)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Distortion");

    // var textBoxWidth = 180;

    //     // Add a border box for the text blocks
    // svg.append("rect")
    //         .attr("x", width + margin.left - textBoxWidth)  // Adjust x position to fit the text
    //         .attr("y", margin.top - 15)                      // Adjust y position to fit the text
    //         .attr("width", textBoxWidth)                     // Set the width of the text box
    //         .attr("height", 40)                              // Set the height of the text box
    //         .attr("fill", "red")
    //         .attr("fill-opacity", 0.5)

    //         .attr("stroke", "black")
    //         .attr("stroke-width", 0);

    // Add text for selected K and Distortion values
    svg.append("text")
        .attr("id", "selected-k")
        .attr("x", width + margin.left -10)
        .attr("y", margin.top + 20)
        .attr("text-anchor", "end")
        .attr("fill", "red")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("K: " +  String(selected_k));

    svg.append("text")
        .attr("id", "selected-distortion")
        .attr("x", width + margin.left -10)
        .attr("y", margin.top + 40)
        .attr("text-anchor", "end")
        .attr("fill", "red")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Distortion: " +  String(distortions[selected_k-1].toFixed(2)));
}
