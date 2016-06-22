var express = require('express');
var bodyParser = require('body-parser');
var hbs = require('express-hbs');

var app = express();
app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/rest/notes', require('./src/backend/routes/notesRouter.js'));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

const hostname = '127.0.0.1';
const port = 3001;
app.listen(port, hostname, () => {  console.log(`Server running at http://${hostname}:${port}/`); });