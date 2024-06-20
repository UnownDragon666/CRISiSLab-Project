const socket = io();

const waterHeightTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Water Height (cm)'
};

const waterHeightDifferenceTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Water Height Difference (cm)'
};

const waterHeightData = [waterHeightTrace];
const waterHeightDifferenceData = [waterHeightDifferenceTrace];

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

const waterHeightDifferenceLayout = {
    title: 'Water Height Difference',
    xaxis: {
        title: 'Time',
        type: 'date'
    },
    yaxis: {
        title: 'Difference (cm)'
    }
};

const config = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
        'toImage', 'pan2d', 'autoScale2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d', 'hoverClosestCartesian', 'toggleSpikelines'
    ],
    showLink: false,
    responsive: true,
    displaylogo: false
};

Plotly.newPlot('waterHeightGraph', waterHeightData, waterHeightLayout, config);
Plotly.newPlot('standingWaterHeightDifference', waterHeightDifferenceData, waterHeightDifferenceLayout, config);

let highestWaterHeight = 0;
let threshold = 999;
let standingWaterHeight = 0;

document.getElementById('submitThreshold').addEventListener('click', () => {
    const thresholdInput = document.getElementById('threshold').value;
    threshold = parseFloat(thresholdInput);
    console.log(`Threshold set to ${threshold} cm`);
    updateThresholdLine(threshold);
});

document.getElementById('submitStandingWaterHeight').addEventListener('click', () => {
    const standingWaterHeightInput = document.getElementById('standing-water-height').value;
    standingWaterHeight = parseFloat(standingWaterHeightInput);
    console.log(`Standing water height set to ${standingWaterHeight} cm`);
});

socket.on('data', (jsonData) => {
    const currentTime = new Date();
    const waterHeight = jsonData.water_height;
    const waterHeightDifference = waterHeight - standingWaterHeight;

    waterHeightTrace.x.push(currentTime);
    waterHeightTrace.y.push(waterHeight);

    waterHeightDifferenceTrace.x.push(currentTime);
    waterHeightDifferenceTrace.y.push(waterHeightDifference);

    const tenSecondsAgo = new Date(currentTime - 10000);

    waterHeightTrace.x = waterHeightTrace.x.filter(time => time > tenSecondsAgo);
    waterHeightTrace.y = waterHeightTrace.y.slice(-waterHeightTrace.x.length);

    waterHeightDifferenceTrace.x = waterHeightDifferenceTrace.x.filter(time => time > tenSecondsAgo);
    waterHeightDifferenceTrace.y = waterHeightDifferenceTrace.y.slice(-waterHeightDifferenceTrace.x.length);

    Plotly.update('standingWaterHeightDifference', {
        x: [waterHeightDifferenceTrace.x],
        y: [waterHeightDifferenceTrace.y]
    }, {
        'xaxis.range': [tenSecondsAgo, currentTime]
    }, {
        transition: {
            duration: 200,
            easing: 'linear'
        }
    });

    Plotly.update('waterHeightGraph', {
        x: [waterHeightTrace.x],
        y: [waterHeightTrace.y]
    }, {
        'xaxis.range': [tenSecondsAgo, currentTime]
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

    if (standingWaterHeight != 0) {
        if (waterHeightDifference > threshold) {
        triggerAlarm();
        }
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

    Plotly.relayout('standingWaterHeightDifference', { shapes });
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
    cmUnit.innerHTML = '<p>cm</p>';
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
    displayAlert(true);
}

function stopAudio() {
    audioElement.pause();
    audioElement.currentTime = 0;
    clearTimeout(timeoutId);
    displayAlert(false);
}

function displayAlert(triggered) {
    const alertElement = document.getElementById('alert');
    const stopAlertButton = document.getElementById('stopAlertButton');

    if (triggered) {
        alertElement.style.backgroundColor = 'red';
        alertElement.classList.add('flashing');
        stopAlertButton.style.display = 'block';
    } else {
        alertElement.style.backgroundColor = 'grey';
        alertElement.classList.remove('flashing');
        stopAlertButton.style.display = 'none';
    }
}

function stopAlert() {
    stopAudio();
}
