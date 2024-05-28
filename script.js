document.addEventListener('DOMContentLoaded', function() {
    var trace = {
        x: [],
        y: [],
        mode: 'lines+markers',
        line: {shape: 'linear', color: '#ffffff'},
        marker: {color: '#00ffff'}
    };

    var layout = {
        title: 'Sea Themed Linear Animated Graph',
        xaxis: {
            range: [0.0, 10.0],
            title: 'Time (s)',
            color: '#ffffff',
            showgrid: true,
            gridcolor: '#ffffff',
            zeroline: true,
            zerolinecolor: '#ffffff'
        },
        yaxis: {
            range: [0, 12],
            title: 'Water Height',
            color: '#ffffff',
            showgrid: true,
            gridcolor: '#ffffff',
            zeroline: true,
            zerolinecolor: '#ffffff'
        },
        paper_bgcolor: 'rgba(0, 0, 0, 0.3)',
        plot_bgcolor: 'rgba(0, 0, 0, 0.3)',
        font: {
            color: '#ffffff'
        }
    };

    var data = [trace];

    Plotly.newPlot('graph', data, layout);

    var socket = io();

    socket.on('data', function(msg) {
        var counter = msg.x;

        var yValue = counter + 1;

        Plotly.extendTraces('graph', {
            x: [[counter]],
            y: [[yValue]]
        }, [0]);

        var xRangeStart = Math.max(0, counter - 10);
        var yRangeStart = Math.max(0, yValue - 10);
        var update = {
            xaxis: {
                range: [xRangeStart, counter]
            },
            yaxis: {
                range: [yRangeStart, yValue + 2]
            }
        };

        Plotly.relayout('graph', update);
        document.getElementById('data').innerHTML = `Counter: ${counter}`;
    });
});
