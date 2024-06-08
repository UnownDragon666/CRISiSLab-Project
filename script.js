const socket = io();

const pressureTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Pressure (hPa)'
};

const waterHeightTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Water Height (cm)'
};

const pressureData = [pressureTrace];
const waterHeightData = [waterHeightTrace];

const pressureLayout = {
    title: 'Real-time Pressure Data',
    xaxis: {
        title: 'Time'
    },
    yaxis: {
        title: 'Pressure (hPa)'
    }
};

const waterHeightLayout = {
    title: 'Real-time Water Height Data',
    xaxis: {
        title: 'Time'
    },
    yaxis: {
        title: 'Water Height (cm)'
    }
};

Plotly.newPlot('pressureGraph', pressureData, pressureLayout);
Plotly.newPlot('waterHeightGraph', waterHeightData, waterHeightLayout);

socket.on('data', (jsonData) => {
    const time = new Date().toLocaleTimeString();
    const pressure = jsonData.pressure_hpa;
    const waterHeight = jsonData.water_height;

    Plotly.extendTraces('pressureGraph', {
        x: [[time]],
        y: [[pressure]]
    }, [0]);

    Plotly.extendTraces('waterHeightGraph', {
        x: [[time]],
        y: [[waterHeight]]
    }, [0]);

    const maxPoints = 50;

    if (pressureTrace.x.length > maxPoints) {
        pressureTrace.x.shift();
        pressureTrace.y.shift();
    }

    if (waterHeightTrace.x.length > maxPoints) {
        waterHeightTrace.x.shift();
        waterHeightTrace.y.shift();
    }

    document.getElementById('data').innerHTML = `Pressure: ${pressure.toFixed(2)} hPa | Water Height: ${waterHeight.toFixed(2)} cm`;
});
