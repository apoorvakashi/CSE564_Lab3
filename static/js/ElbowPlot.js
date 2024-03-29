function renderElbowPlot(data){
    console.log("Rendering Elbow Plot with idi = ", selected_idi, "and K = ", selected_k)
    var kValues = data.K
    var distortions = data.distortions

    var svgWidth = 700;
    var svgHeight = 350;
    var margin = { top: 40, right: 40, bottom: 60, left: 80 };
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
        .attr("stroke-width", 2);

    // Draw dots
    const dots = svg.selectAll(".dot")
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

            selected_k = distortions.indexOf(d) + 1;
            console.log("K is now ",  selected_k);

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

            fetchandRenderMDSDataPlot();
            fetchandRenderPCPlot();
        });

    
    dots.append("title")
        .text((d, i) =>  ` K : ${i+1} \nDistortion : ${d.toFixed(2)}`)
        .attr("style", "fill: red;"); 

    // Add x axis
    svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("color", "white")
        .call(d3.axisBottom(xScale));

    // Add y axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("color", "white")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 50)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("K value");
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - margin.top)
        .attr("y", margin.left - 60)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
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

    const elbowPoint = findElbowPoint(distortions);
    console.log("Elbow point", elbowPoint)
    if (elbowPoint) {
        svg.append("line")
            .attr("x1", xScale(elbowPoint.k))
            .attr("y1", yScale(distortions[elbowPoint.k - 1]))
            .attr("x2", xScale(elbowPoint.k))
            .attr("y2", yScale(elbowPoint.value))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "4");

        svg.append("path")
            .attr("d", d3.symbol().type(d3.symbolStar).size(50))
            .attr("transform", `translate(${xScale(elbowPoint.k)},${yScale(elbowPoint.value)}) rotate(-90)`)
            .attr("fill", "blue");
    }
}

function findElbowPoint(distortions) {
    let distances = [];

    // Calculate the line from the first to the last point
    let lineSlope = (distortions[distortions.length - 1] - distortions[0]) / (distortions.length - 1);
    let lineIntercept = distortions[0];

    distortions.forEach((inertia, index) => {
        let lineY = lineSlope * index + lineIntercept;
        distances.push({ k: index + 1, distance: Math.abs(inertia - lineY), value: inertia });
    });

    // Find the point with the maximum distance from the line
    distances.sort((a, b) => b.distance - a.distance);
    return distances[0];
}