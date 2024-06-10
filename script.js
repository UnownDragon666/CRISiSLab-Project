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
            }
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

            document.getElementById('data').innerHTML = `Pressure: ${pressure.toFixed(2)} hPa | Water Height: ${waterHeight.toFixed(2)} cm`;
        });

        function updateWaterHeightDisplay(value) {
            const valueString = value.replace('.', '');
            const digits = valueString.split('');
            
            digits.forEach((digit, index) => {
                const group = document.querySelectorAll('.number-grp')[index];
                const numberGrpWrp = group.querySelector('.number-grp-wrp');
                const numElement = numberGrpWrp.querySelector('.num-' + digit);
                const topOffset = -numElement.offsetTop;

                gsap.to(numberGrpWrp, { y: topOffset, duration: 0.5, ease: 'power2.inOut' });
            });
        }
