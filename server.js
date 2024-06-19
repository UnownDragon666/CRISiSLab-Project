const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const port = new SerialPort({ path: '/dev/tty.usbmodem21401', baudRate: 9600 });

port.on('error', (err) => {
    console.error('SerialPort Error:', err);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (data) => {
    console.log('Received data:', data);
    if (isValidJson(data)) {
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed JSON:', jsonData);
            io.emit('data', jsonData);
        } catch (err) {
            console.error('Error parsing JSON:', err);
        }
    } else {
        console.error('Received invalid JSON:', data);
    }
});

function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

server.on('error', (err) => {
    console.error('Server Error:', err);
});

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
