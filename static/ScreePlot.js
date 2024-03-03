// ScreePlot.js
// Function to render the scree plot using D3.js
function renderScreePlot(screePlotData, selected_components = 0) {
    console.log("Rendering scree plot")
    selected_idi = selected_components;
    // Your D3.js code to render the scree plot using the received data
    var svgWidth = 900;
    var svgHeight = 500;
    var margin = { top: 20, right: 20, bottom: 80, left: 80 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('#chart-container')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X Scale
    var x = d3.scaleLinear()
        .domain([0, d3.max(screePlotData, function(d) { return d.factor; })])
        .range([0, width]);

    // Y Scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(screePlotData, function(d) { return d.eigenvalue; })])
        .range([height, 0]);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    svg.append('g')
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    // X-axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Number of Components");

    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Eigenvalue");

    svg.selectAll(".bar")
        .data(screePlotData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.factor) - ((width/20)/2); }) // offset for centering bars with data points
        .attr("y", function(d) { return y(d.eigenvalue); })
        .attr("width", (width/20)-1) // width of the bar
        .attr("height", function(d) { return height - y(d.eigenvalue); }) // height of the bar
        .style("fill", function(_, i) {
            return i < selected_components ? "orange" : "lightgray";
        });


    svg.selectAll(".line-segment")
        .data([generateLineData(screePlotData, 19)]) // Bind only the filtered data
        .enter().append("path")
        .attr("class", "line-segment")
        .attr('fill', 'none')
        .attr("stroke", "#808080") // Set default stroke color for the entire line
        .attr('stroke-width', 1.5) // Set default stroke width for the entire line
        .attr('d', d3.line()
            .x(function(d) { return x(d.factor); })
            .y(function(d) { return y(d.eigenvalue); })
        );
    
    svg.append("path")
        .data([generateLineData(screePlotData, selected_components)])
        .attr('fill', 'none')
        .attr("stroke", "red") 
        .attr('stroke-width', 4) 
        .attr('d', d3.line()
            .x(function(d) { return x(d.factor); })
            .y(function(d) { return y(d.eigenvalue); })
        ); 

        // Plot Data Points
    const dots = svg.selectAll(".dot")
        .data(screePlotData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.factor); })
        .attr("cy", function(d) { return y(d.eigenvalue);})
        .style("fill", function(_, i) {
            return i < selected_components ? "red" : "#808080";
        })
        .attr("r", function(_, i) {
            return i < selected_components ? 6 : 5;
        })
        .on("click", function(d, i) {
            // Reset previous highlighting
            selected_idi = i.factor;
            updateSelectedIDIValue()
            console.log("Dot ", i.factor, " clicked. Updating Scree plot");
            updateScreePlot(screePlotData, i.factor);
        });

    dots.append("title")
        .attr("class", "tooltipScree")
        .text((d, i) => `PC${i} : ${d.eigenvalue.toFixed(4)}`);

}

function updateScreePlot(data, selected_components){
    d3.select("#chart-container").selectAll("*").remove();
    selected_idi = 0;
    renderScreePlot(data, selected_components);
}

function generateLineData(data, selected_components) {
    return data.slice(0, selected_components);
}