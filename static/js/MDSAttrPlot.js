function renderMDSAttrPlot(mdsdata){
    console.log("Rendering MDS Data Plot with K = ", selected_k)

    data = mdsdata.mds_attr

    var svgWidth = 700;
    var svgHeight = 350;
    var margin = { top: 20, right:20, bottom: 60, left: 60 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    d3.select("#mds-attr-plot-container").selectAll("*").remove();

    var svg = d3.select("#mds-attr-plot-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var domainPadding = 0.2; // Padding value

    // Calculate the extent of Comp1
    var comp1Extent = d3.extent(data, d => d.Comp1);

    // Add padding to the extent
    var paddedExtent = [comp1Extent[0], comp1Extent[1] + domainPadding];

    // Set scales for x and y axes
    var xScale = d3.scaleLinear()
        .domain(paddedExtent) // Assuming Comp1 is the first MDS component
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Comp2)) // Assuming Comp2 is the second MDS component
        .range([height, 0]);


    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    svg.append('g')
        .call(d3.axisLeft(yScale).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
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
        .style("font-weight", "bold")
        .text("Component 2");

    // Draw data points
    // svg.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xScale(d.Comp1)) // Assuming Comp1 is the first MDS component
    //     .attr("cy", d => yScale(d.Comp2)) // Assuming Comp2 is the second MDS component
    //     .attr("r", 5)
    //     .style("fill", "steelblue");

    var selectedAttributes = [];
    var linesGroup = svg.append("g");

    svg.selectAll(null)
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.Comp1) + 7 ) // Adjust x position for label
        .attr("y", d => yScale(d.Comp2)) // Adjust y position for label
        .text(d => d.feature)
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "black");

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Comp1))
        .attr("cy", d => yScale(d.Comp2))
        .attr("r", 5)
        .style("fill", "steelblue")
        .on("click", function (event, d) {


            var circle = d3.select(this);

            if (circle.classed("selected")) {
                console.log("Unclick")
                circle.classed("selected", false);
                circle.style("stroke", null); // Remove stroke
                var index = selectedAttributes.indexOf(d.feature);
                if (index !== -1) {
                    selectedAttributes.splice(index, 1); // Remove from selectedAttributes
                }
            } else {
                console.log("Click")
                circle.classed("selected", true);
                circle.style("stroke", "black");
                circle.style("stroke-width", "2px"); // Add stroke
                 // Add stroke
                selectedAttributes.push(d.feature); // Add to selectedAttributes
            }
            console.log(selectedAttributes)
            drawLines();
            fetchandRenderPCPlot(selectedAttributes);
        });

    function drawLines() {
        linesGroup.selectAll("line").remove(); 
        linesGroup.selectAll("text").remove();
        linesGroup.selectAll("rect").remove(); // Remove existing lines
    
        // Draw lines if at least two points are selected
        if (selectedAttributes.length >= 2) {
            for (var i = 1; i < selectedAttributes.length; i++) {
                var startFeature = selectedAttributes[i - 1];
                var endFeature = selectedAttributes[i];
    
                var startPoint = data.find(d => d.feature === startFeature);
                var endPoint = data.find(d => d.feature === endFeature);

                var startX = xScale(startPoint.Comp1);
                var startY = yScale(startPoint.Comp2);
                var endX = xScale(endPoint.Comp1);
                var endY = yScale(endPoint.Comp2);
                
                var line = linesGroup.append("line")
                    .attr("x1", xScale(startPoint.Comp1))
                    .attr("y1", yScale(startPoint.Comp2))
                    .attr("x2", xScale(endPoint.Comp1))
                    .attr("y2", yScale(endPoint.Comp2))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("marker-end", "url(#arrow)")
                    .style("stroke-dasharray", ("3, 3")); // Add dashed style to line

                // Calculate midpoint coordinates
                var midX = (startX + endX) / 2;
                var midY = (startY + endY) / 2;

                // Append rounded background rectangle
                var rect = linesGroup.append("rect")
                    .attr("x", midX - 10) // Adjust width based on text length
                    .attr("y", midY - 10) // Adjust height based on text size
                    .attr("width", 20) // Adjust width based on text length
                    .attr("height", 20) // Adjust height based on text size
                    .attr("rx", 10) // Round corner x-radius
                    .attr("ry", 10) // Round corner y-radius
                    .style("fill", "white");

                // Append text with count
                linesGroup.append("text")
                    .attr("x", midX)
                    .attr("y", midY)
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .text(i); // Display count as 'i'
            }
        }
    }
} 