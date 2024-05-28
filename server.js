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
const serialPortPath = '/dev/cu.usbmodem11401';
console.log(`Using serial port: ${serialPortPath}`);

const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (data) => {
    console.log(`Received data: ${data}`);
    try {
        const jsonData = JSON.parse(data);
        io.emit('data', jsonData);
    } catch (error) {
        console.error(`Error parsing JSON: ${error}`);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
