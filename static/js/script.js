// script.js

var selected_idi = 5;
var selected_k = 3;

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
