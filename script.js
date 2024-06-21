const socket = io();

const waterHeightTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Water Height (cm)',
    line: {
        color: '#287afc',
        width: '4'
    }
};

const waterHeightDifferenceTrace = {
    x: [],
    y: [],
    mode: 'lines',
    name: 'Water Height Difference (cm)',
    line: {
        color: '#287afc',
        width: '4'
    }
};

const waterHeightData = [waterHeightTrace];
const waterHeightDifferenceData = [waterHeightDifferenceTrace];

const waterHeightLayout = {
    title: 'Real-time Water Height Data',
    xaxis: {
        title: 'Time',
        type: 'date',
        color: 'white',
        tickcolor: 'white',
        fixedrange: true // Disable user interaction
    },
    yaxis: {
        title: 'Water Height (cm)',
        range: [0, 20], // Initial y-axis range
        color: 'white',
        tickcolor: 'white',
        rangemode: 'nonnegative', // Prevent values below 0
        fixedrange: true // Disable user interaction
    },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
        color: 'white'
    },
    shapes: []
};

const waterHeightDifferenceLayout = {
    title: 'Water Height Difference',
    xaxis: {
        title: 'Time',
        type: 'date',
        color: 'white',
        tickcolor: 'white',
        fixedrange: true // Disable user interaction
    },
    yaxis: {
        title: 'Difference (cm)',
        range: [0, 20], // Initial y-axis range
        color: 'white',
        tickcolor: 'white',
        rangemode: 'nonnegative', // Prevent values below 0
        fixedrange: true // Disable user interaction
    },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: {
        color: 'white'
    }
};

const config = {
    displayModeBar: false, // Hide mode bar
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
    let waterHeight = jsonData.water_height;
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

    let yMaxWaterHeight = Math.max(20, ...waterHeightTrace.y); 
    let yMaxWaterHeightDifference = Math.max(20, ...waterHeightDifferenceTrace.y); 

    Plotly.update('standingWaterHeightDifference', {
        x: [waterHeightDifferenceTrace.x],
        y: [waterHeightDifferenceTrace.y]
    }, {
        'xaxis.range': [tenSecondsAgo, currentTime],
        'yaxis.range': [0, yMaxWaterHeightDifference]
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
        'xaxis.range': [tenSecondsAgo, currentTime],
        'yaxis.range': [0, yMaxWaterHeight]
    }, {
        transition: {
            duration: 200,
            easing: 'linear'
        }
    });

    // Correctly handle the highest water height display
    if (jsonData.water_height > highestWaterHeight) {
        highestWaterHeight = Math.min(jsonData.water_height, 999); 
        updateWaterHeightDisplay(highestWaterHeight); // Pass the whole number
    }

    if (standingWaterHeight !== 0) {
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

    // Convert the value to an integer
    const intValue = Math.floor(value);
    const valueString = intValue.toString();
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

        // Correctly set the top offset for animation
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
    const alertIcon = document.getElementById('alert-icon');
    const stopAlertButton = document.getElementById('stopAlertButton');
    const contentElement = document.getElementById('content');

    if (triggered) {
        alertElement.style.opacity = '1';
        alertElement.classList.add('pulsating');
        stopAlertButton.style.display = 'block';
        contentElement.classList.add('content-red'); // Correctly add the class
    } else {
        alertElement.style.opacity = '0';
        alertElement.classList.remove('pulsating');
        stopAlertButton.style.display = 'none';
        contentElement.classList.remove('content-red'); // Correctly remove the class
    }
}

function stopAlert() {
    stopAudio();
}

// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        hideLoadingScreen();
    }, 3000); // Adjust the delay time as needed (3 seconds in this example)
});

function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    loadingScreen.style.opacity = '0'; // Fade out effect
    loadingScreen.addEventListener('transitionend', function () {
        loadingScreen.style.display = 'none'; // Hide the loading screen after animation
    });
}

function animateWaterHeightDisplay() {
    const waterHeightSvg = document.querySelector('.water-height-svg');
    let position = 0;
    const speed = 0.1;

    function update() {
        position += speed;
        waterHeightSvg.style.transform = `translateY(${position}px)`;
        requestAnimationFrame(update);
    }

    update();
}

animateWaterHeightDisplay();
