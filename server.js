// Setup dependencies
var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    websocket = require('socket.io')(http),
    bodyParser = require('body-parser'),
    hbs = require('express-hbs');

// Setup websocket container
socketProvider = require('./src/backend/services/socketProvider').register(websocket);

// Register json body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup routing
app.use('/rest/notes', require('./src/backend/routes/notesRouter'));
app.use(express.static(__dirname + '/src/public'));

// Setup websocket
websocket.on('connection', function (socket) {
    console.log('user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

// Setup http listener
const port = 3001;
const host = 'localhost';
http.listen(port, host, () => {  console.log(`Server running at http://${host}:${port}/`); });