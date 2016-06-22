
var websocket = null;
var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    websocket = require('socket.io')(http),
    bodyParser = require('body-parser'),
    hbs = require('express-hbs'),
    sockectStorrage = require('./src/backend/services/socketService').register(websocket);

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/rest/notes', require('./src/backend/routes/notesRouter'));

app.use(express.static(__dirname + '/src/public'));

if (websocket) {
    websocket.on('connection', function (socket) {
        console.log('user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

const port = 3001;
const host = 'localhost';
http.listen(port, host, () => {  console.log(`Server running at http://${host}:${port}/`); });