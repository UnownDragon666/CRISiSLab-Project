/*** Atempt at using plot.js to grpah a counter (Doesn't Work Yet) ***/
  // Initial plot data
  var trace1 = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Sensor 1'
};

var trace2 = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Sensor 2'
};

var data = [trace1, trace2];

// Initial plot
Plotly.newPlot('myDiv', data);

// Set up Socket.io
const socket = io();

let startTime = null;
const maxPoints = 100; // Number of points to display

// Handle incoming data
socket.on('arduino-data', (newData) => {
    console.log('Received data:', newData);
    document.getElementById('data').textContent = `Counter: ${newData.x}`;

    // Initialize start time
    if (!startTime) {
        startTime = new Date(newData.timestamp);
    }

    // Calculate elapsed time in seconds
    var currentTime = new Date(newData.timestamp);
    var elapsedTime = (currentTime - startTime) / 1000; // in seconds

    // Update plot data
    data[0].x.push(elapsedTime);
    data[0].y.push(newData.y1);

    data[1].x.push(elapsedTime);
    data[1].y.push(newData.y2);

    // Keep only the last `maxPoints` points
    if (data[0].x.length > maxPoints) {
        data[0].x.shift();
        data[0].y.shift();
        data[1].x.shift();
        data[1].y.shift();
    }

    // Update the plot
    Plotly.react('myDiv', data);
});
