// script.js

var selected_idi = 5;
var selected_k = 3;

document.addEventListener('DOMContentLoaded', function() {

    fetchandRenderScreePlot();
    fetchandRenderElbowPlot();
    fetchandRenderBiPlot();
    fetchandRenderScatterPlot();
});

function updateSelectedIDIValue() {
    // Get the selected_idi div element
    var selectedIDIElement = document.getElementById('selected_idi');
    // Update the content with the value of selectedComponents
    if (selected_idi === 0){
        selectedIDIElement.textContent = "Null";
    }
    else{
        selectedIDIElement.textContent = selected_idi;
    }
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
    updateSelectedIDIValue()
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

function fetchandRenderScatterPlot(){

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

    fetch('/pca_idi_data')
        .then(response => response.json())
        .then(data => {
            // Once data is fetched, create the scatter plot matrix
            d3.select("#scatter-plot-container").selectAll("*").remove();
            renderScatterPlotMatrix(data);
            // renderAttributeTable(data);
        })
        .catch(error => console.error('Error:', error));

}

function fetchandRenderBiPlot(){
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

    fetch('/pca_idi_data')
        .then(response => response.json())
        .then(data => {
            d3.select("#bi-plot-container").selectAll("*").remove();
            renderBiPlot(data);
        })
        .catch(error => console.error('Error fetching bi plot data:', error));

}




