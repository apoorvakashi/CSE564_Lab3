// script.js

var selected_idi = 5;
var selected_k = 3;

document.addEventListener('DOMContentLoaded', function() {

    fetchandRenderScreePlot();
    fetchandRenderElbowPlot();
    fetchandRenderMDSAttrPlot();
    fetchandRenderMDSDataPlot();
    fetchandRenderPCPlot();
});

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the reset button
    document.getElementById("reset-button1").addEventListener("click", handleReset);
    document.getElementById("reset-button2").addEventListener("click", handleReset);
});

function handleReset() {

    fetchandRenderMDSAttrPlot();
    fetchandRenderPCPlot();
}

// Function to load external JavaScript files dynamically
function loadScript(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}


function fetchandRenderScreePlot(){
    // updateSelectedIDIValue()
    console.log(selected_idi)
    d3.select("#scree-plot-container").selectAll("*").remove();
    fetch('/pca_data')
        .then(response => response.json())
        .then(data => {
            // Call the function to render the scree plot defined in ScreePlot.js
            renderScreePlot(data.pca_scree_plot_data);
        })
        .catch(error => console.error('Error fetching scree plot data:', error));
}

function fetchandRenderElbowPlot(){
    d3.select("#elbow-plot-container").selectAll("*").remove();
    fetch('/elbow_plot_data')
        .then(response => response.json())
        .then(data => {
            // Call the function to render the scree plot defined in ScreePlot.js
            renderElbowPlot(data);
        })
        .catch(error => console.error('Error fetching elbow plot data:', error));
}

function fetchandRenderMDSDataPlot(){
    fetch('/receive_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'idi' : selected_idi, 'k' : selected_k})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the response from the Flask route
    })
    .catch(error => {
        console.error('Error:', error);
    });

    fetch('/mds_data')
    .then(response => response.json())
    .then(data => {
        // Call the function to render the scree plot defined in ScreePlot.js
        console.log("Rendering MDS DATA PLOT")
        renderMDSDataPlot(data);
    })
    .catch(error => console.error('Error fetching MDS Data plot data:', error));
}

function fetchandRenderMDSAttrPlot(){
    fetch('/mds_attr')
    .then(response => response.json())
    .then(data => {
        // Call the function to render the scree plot defined in ScreePlot.js
        console.log("Rendering MDS Attr Plot")
        renderMDSAttrPlot(data);
    })
    .catch(error => console.error('Error fetching MDS Attr plot data:', error));
}

function fetchandRenderPCPlot(selectedAttributes = null){
    fetch('/pcp_data')
    .then(response => response.json())
    .then(data => {
        renderPCPlot(data, selectedAttributes);
    })
    .catch(error => console.error('Error fetching PCP data', error));
}

