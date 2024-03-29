function renderPCPlot(data, selectedAttributes=null) {
    var pcpData = data.pcp_data;
    var features;

    categorical = ['Reputation', 'Position2', 'Club', 'Body Type', 'Preferred Foot']
    numerical = ['Age', 'Value','Wage','Acceleration', 'Overall', 'Balance','Stamina'
             ,'HeadingAccuracy', 'StandingTackle', 'SlidingTackle' ]

    if (selectedAttributes != null && selectedAttributes.length > 1){
        features = selectedAttributes
    }
    else{
        features = data.features;
    }
    
    var cluster_id = data.cluster_id;

    d3.select("#pc-plot-container").selectAll("*").remove();

    var clusters = Array.from(new Set(cluster_id));
    pcpData.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.cluster_id = cluster_id[pcpData.indexOf(d)];
    });

    const colorScale = d3.scaleOrdinal()
        .domain(clusters)
        .range(d3.schemeCategory10);

    pcpData.forEach(d => {
        // Assign a color to each data point based on its cluster ID
        d.color = colorScale(d.cluster_id);
    });

    var margin = { top: 30, right: 10, bottom: 60, left: 50 },
        width = 1600 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    var x = d3.scalePoint().range([0, width]).padding(1),
        y = {};

    var line = d3.line(),
        axis = d3.axisLeft();

    var svg = d3.select("#pc-plot-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Extract the list of dimensions and create a scale for each.
    x.domain(features);

    // features.forEach(function (d) {
    //     y[d] = d3.scaleLinear()
    //         .domain(d3.extent(pcpData, function (p) { return +p[d]; }))
    //         .range([height, 0]);
    // });

    features.forEach(function (d) {
        if (numerical.includes(d)) {
            // Numerical feature
            y[d] = d3.scaleLinear()
                .domain(d3.extent(pcpData, function (p) { return +p[d]; }))
                .range([height, 0]);
        } else {
            // Categorical feature
            var categories = pcpData.map(function(p) { return p[d]; });
            y[d] = d3.scalePoint()
                .domain(categories)
                .range([height, 0])
                .padding(0.1); // Adjust padding as needed
        }
    });
    

    lines = svg.selectAll("path")
        .data(pcpData)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "lines-group")
        .style("stroke", d => d.color) // Set the color for the lines
        .style("stroke-width", "0.5px")
        .style("fill", "none");

    // Returns the path for a given data point.
    function path(d) {
        return line(features.map(function (p) {
            
            return [x(p), y[p](d[p])];
        }));
    }

    var g = svg.selectAll(".dimension")
        .data(features)
        .enter().append("g")
        .attr("class", "dimension")
        .style("font-weight", "bold")
        .style("font-size", "12px")
        .style("color", "white")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; });

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .attr("class", "title")
        .attr("y", -9)
        .style("font-weight", "bold")
        .style("font-size", "12px")
        .style("color", "white")
        .text(function (d) { return d; });

    // Add text labels for each axis.
    g.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(0)")
        .attr("y", height + 30)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(function (d) { return d; });
    
        // Drag behavior for axes reordering
        var drag = d3.drag()
        .on("start", dragstart)
        .on("drag", dragmove)
        .on("end", dragend);

        g.call(drag);

        var draggedIndex = null;

        function dragstart(event, d) {
            draggedIndex = features.indexOf(d);
        }

        function dragmove(event, d) {
            var currentIndex = features.indexOf(d);
            var dx = event.x - x(d);
            var threshold = x.step() / 2;

            if (dx < -threshold && currentIndex > 0 && currentIndex - 1 !== draggedIndex) {
                // Move left
                features.splice(currentIndex - 1, 0, features.splice(currentIndex, 1)[0]);
                redrawAxes();
                redrawLines(features);
            } else if (dx > threshold && currentIndex < features.length - 1 && currentIndex + 1 !== draggedIndex) {
                // Move right
                features.splice(currentIndex + 1, 0, features.splice(currentIndex, 1)[0]);
                redrawAxes();
                redrawLines(features);
            }
        }

        function dragend(event, d) {
            draggedIndex = null;
            redrawLines()
        }

        function redrawAxes() {
            x.domain(features);
            console.log(features)

            // Move the axes
            console.log("REdrawing axes")
            g.transition()
                .duration(500)
                .attr("transform", function (d) { return "translate(" + x(d) + ")"; });

        }

        function redrawLines(features)
        {
            console.log("Redrawing lines")

            svg.selectAll("path")
            .data(pcpData)
            .transition()
            .duration(500)
            .attr("d", path)
    
        // Returns the path for a given data point.
            function path2(d) {
                return line(features.map(function (p) {
                    if(p === "Wage")
                    {
                        console.log(x(p))
                        console.log(y[p](d[p]))
                    }
                    return [x(p), y[p](d[p])];
                }));
            }

        }

    // // Initialize brush
    // function initializeBrush(brush, d, yScale) {
    //     brush.extent([[x(d) - 10, 0], [x(d) + 10, height]]);
    //     brush.on("brush", function (event) { brushed(event, yScale, d); });
    //     brush.on("end", function (event) { brushed(event, yScale, d); });
    // }

    // // Add brush to each axis
    // features.forEach(function (d) {
    //     const brush = d3.brushY();
    //     initializeBrush(brush, d, y[d]);

    //     g.append("g")
    //         .attr("class", "brush")
    //         .call(brush)
    //         .call(brush.move, y[d].range());
            
    //         console.log(y[d].range());// Set initial brush position
    // });

    // // Brush functionality
    // function brushed(event, yScale, dimension) {
    //     // console.log("Brush event triggered");

    //     const selection = event.selection;
    //     if (!selection) {
    //         // console.log("No selection. Resetting data display.");

    //         // If no selection, reset the filtering
    //         pcpData.forEach(function (d) {
    //             d3.select(this.parentNode).selectAll("path").style("display", null);
    //         });
    //     } else {
    //         // console.log("Selection made. Filtering data.");

    //         // Filter the data based on the selection
    //         const selectedRange = selection.map(yScale.invert);

    //         pcpData.forEach(function (d) {
    //             if (selectedRange[0] <= d[dimension] && d[dimension] <= selectedRange[1]) {
    //                 d3.select(this.parentNode).selectAll("path").style("display", "none");
    //             } else {
    //                 d3.select(this.parentNode).selectAll("path").style("display", null);
    //             }
    //         });
    //     }
    // }


}


