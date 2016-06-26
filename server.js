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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Setup routing
app.use('/rest/notes', require('./src/backend/routes/notesRouter'));
app.use(express.static(__dirname + '/src/public'));

// Setup websocket
websocket.on('connection', function (socket) {
    console.log(new Date() + ' user connected id:' + socket.id);
    socket.on('disconnect', function () {
        console.log('user disconnected id:' + socket.id);
    });
});

// Setup http listener
const port = 3001;
const host = '0.0.0.0'; //changed so it can get accessed from external ip adress(real mobile test)
http.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});