
var websocket = null;
var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    websocket = require('socket.io')(http);;
    bodyParser = require('body-parser'),
    hbs = require('express-hbs');

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/rest/notes', require('./src/backend/routes/notesRouter.js')(websocket));

app.use(express.static(__dirname + '/src/public'));

if (websocket) {
    websocket.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}

const port = 3001;
http.listen(port, () => {  console.log(`Server running at http://localhost:${port}/`); });