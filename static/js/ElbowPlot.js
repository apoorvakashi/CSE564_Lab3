document.addEventListener('DOMContentLoaded', function() {

    d3.select("#elbow-plot-container").selectAll("*").remove();
    fetch('/elbow_plot_data')
        .then(response => response.json())
        .then(data => {
            // Call the function to render the scree plot defined in ScreePlot.js
            renderScreePlot(data);
        })
        .catch(error => console.error('Error fetching elbow plot data:', error));
});