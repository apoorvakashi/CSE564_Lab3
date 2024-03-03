// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the Scree Plot button
    document.getElementById('scree-plot-btn').addEventListener('click', function() {
        selected_idi = 0;
        updateSelectedIDIValue();

        d3.select("#chart-container").selectAll("*").remove();
        // Load the ScreePlot.js file dynamically
        console.log("Scree Plot button clicked")
        loadScript('static/ScreePlot.js', function() {
            // When ScreePlot.js is loaded, call the function to fetch and render the scree plot
            fetchAndRenderScreePlot();
        });
    });
    document.getElementById('bi-plot-btn').addEventListener('click', function() {
        d3.select("#chart-container").selectAll("*").remove();
        // Load the ScreePlot.js file dynamically
        console.log("Bi Plot button clicked")
        loadScript('static/BiPlot.js', function() {
            // When ScreePlot.js is loaded, call the function to fetch and render the scree plot
            fetchAndRenderBiPlot();
        });
    });
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

// Call the updateSelectedIDIValue function initially to display the initial value
updateSelectedIDIValue();
// Function to load external JavaScript files dynamically
function loadScript(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Function to fetch data and render the scree plot
function fetchAndRenderScreePlot() {
    // Make an AJAX request to fetch data for the scree plot
    // Replace this URL with the appropriate Flask route
    fetch('/pca_data')
        .then(response => response.json())
        .then(data => {
            // Call the function to render the scree plot defined in ScreePlot.js
            renderScreePlot(data.chart_data.pca_scree_plot_data);
        })
        .catch(error => console.error('Error fetching scree plot data:', error));
}

function fetchAndRenderBiPlot() {
    fetch('/pca_data')
        .then(response => response.json())
        .then(data => {
            renderBiPlot(data.chart_data.pca_scree_plot_data);
        })
        .catch(error => console.error('Error fetching Bi plot data:', error));
}
