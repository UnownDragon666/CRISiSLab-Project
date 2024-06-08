const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Adjust the serial port path to match your Arduino's serial port
const port = new SerialPort({ path: '/dev/tty.usbmodem21401', baudRate: 9600 });

// Error handling for SerialPort
port.on('error', (err) => {
    console.error('SerialPort Error:', err);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (data) => {
    if (isValidJson(data)) {
        try {
            const jsonData = JSON.parse(data);
            io.emit('data', jsonData);
        } catch (err) {
            console.error('Error parsing JSON:', err);
        }
    } else {
        console.error('Received invalid JSON:', data);
    }
});

// Function to check if a string is valid JSON
function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Error handling for the HTTP server
server.on('error', (err) => {
    console.error('Server Error:', err);
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
