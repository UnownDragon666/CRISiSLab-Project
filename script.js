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
        title: 'Time',
        type: 'date'
    },
    yaxis: {
        title: 'Pressure (hPa)'
    }
};

const waterHeightLayout = {
    title: 'Real-time Water Height Data',
    xaxis: {
        title: 'Time',
        type: 'date'
    },
    yaxis: {
        title: 'Water Height (cm)'
    },
    shapes: []
};

const config = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
        'toImage',
        'pan2d',
        'autoScale2d',
        'zoom2d',
        'zoomIn2d',
        'zoomOut2d',
        'resetScale2d',
        'hoverClosestCartesian',
        'toggleSpikelines'
    ],
    showLink: false,
    responsive: true,
    displaylogo: false
};

Plotly.newPlot('pressureGraph', pressureData, pressureLayout, config);
Plotly.newPlot('waterHeightGraph', waterHeightData, waterHeightLayout, config);

let highestWaterHeight = 0;
let threshold = 0;

document.getElementById('submitThreshold').addEventListener('click', () => {
    const thresholdInput = document.getElementById('threshold').value;
    threshold = parseFloat(thresholdInput);
    console.log(`Threshold set to ${threshold} mm`);
    updateThresholdLine(threshold);
});

socket.on('data', (jsonData) => {
    const currentTime = new Date();
    const pressure = jsonData.pressure_hpa;
    const waterHeight = jsonData.water_height;

    pressureTrace.x.push(currentTime);
    pressureTrace.y.push(pressure);

    waterHeightTrace.x.push(currentTime);
    waterHeightTrace.y.push(waterHeight);

    const tenSecondsAgo = new Date(currentTime - 10000);
    pressureTrace.x = pressureTrace.x.filter(time => time > tenSecondsAgo);
    pressureTrace.y = pressureTrace.y.slice(-pressureTrace.x.length);

    waterHeightTrace.x = waterHeightTrace.x.filter(time => time > tenSecondsAgo);
    waterHeightTrace.y = waterHeightTrace.y.slice(-waterHeightTrace.x.length);

    Plotly.update('pressureGraph', {
        x: [pressureTrace.x],
        y: [pressureTrace.y]
    }, {
        'xaxis.range': [tenSecondsAgo, currentTime]
    }, {
        transition: {
            duration: 200,
            easing: 'linear'
        }
    });

    const yMin = Math.min(...waterHeightTrace.y) - 10; 
    const yMax = Math.max(...waterHeightTrace.y) + 10;
    const yRange = [yMin, yMax];

    Plotly.update('waterHeightGraph', {
        x: [waterHeightTrace.x],
        y: [waterHeightTrace.y]
    }, {
        'xaxis.range': [tenSecondsAgo, currentTime],
        'yaxis.range': yRange
    }, {
        transition: {
            duration: 200,
            easing: 'linear'
        }
    });

    if (waterHeight > highestWaterHeight) {
        highestWaterHeight = waterHeight;
        updateWaterHeightDisplay(highestWaterHeight.toFixed(2));
    }

    if (waterHeight > threshold) {
        triggerAlarm();
    }
});

function updateThresholdLine(threshold) {
    const shapes = [{
        type: 'line',
        x0: 0,
        x1: 1,
        y0: threshold,
        y1: threshold,
        xref: 'paper',
        yref: 'y',
        line: {
            color: 'red',
            width: 2,
            dash: 'dashdot'
        }
    }];

    Plotly.relayout('waterHeightGraph', { shapes });
}

function updateWaterHeightDisplay(value) {
    const timerClock = document.querySelector('.timer--clock');
    timerClock.innerHTML = ''; 

    const valueString = value.replace('.', '');
    const digits = valueString.split('');

    digits.forEach(digit => {
        const digitGroup = document.createElement('div');
        digitGroup.classList.add('number-grp');

        const numberGrpWrp = document.createElement('div');
        numberGrpWrp.classList.add('number-grp-wrp');

        for (let i = 0; i < 10; i++) {
            const numDiv = document.createElement('div');
            numDiv.classList.add('num', 'num-' + i);
            const numP = document.createElement('p');
            numP.textContent = i;
            numDiv.appendChild(numP);
            numberGrpWrp.appendChild(numDiv);
        }

        digitGroup.appendChild(numberGrpWrp);
        timerClock.appendChild(digitGroup);

        const numElement = numberGrpWrp.querySelector('.num-' + digit);
        const topOffset = -numElement.offsetTop;

        gsap.to(numberGrpWrp, { y: topOffset, duration: 0.5, ease: 'power2.inOut' });
    });

    const cmUnit = document.createElement('div');
    cmUnit.classList.add('cm-unit');
    cmUnit.innerHTML = '<p>mm</p>';
    timerClock.appendChild(cmUnit);
}

const audioElement = document.getElementById('tsunamiWarningAudio');
let timeoutId;

function triggerAlarm() {
    if (!audioElement.paused) return;
    audioElement.play();
    timeoutId = setTimeout(() => {
        stopAudio();
    }, 10000);
}

function stopAudio() {
    audioElement.pause();
    audioElement.currentTime = 0;
    clearTimeout(timeoutId);
}
