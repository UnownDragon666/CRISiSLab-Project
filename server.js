const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Verify the correct serial port path
const serialPortPath = '/dev/cu.usbmodem21201';  // Change this to your serial port path
console.log(`Using serial port: ${serialPortPath}`);

const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (data) => {
    data = data.trim(); // Remove any leading or trailing whitespace
    console.log(`Received data: ${data}`);
    
    // Check if the data is a valid JSON string
    if (data.startsWith('{') && data.endsWith('}')) {
        try {
            const jsonData = JSON.parse(data);
            io.emit('data', jsonData);
        } catch (error) {
            console.error(`Error parsing JSON: ${error}`);
        }
    } else {
        console.error(`Invalid JSON data: ${data}`);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
