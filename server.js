'use strict';
var express = require('express');
var app = express();
var fs = require('fs');
var options = {
	key:fs.readFileSync(__dirname + '/node-http/server.key'),
	cert:fs.readFileSync(__dirname + '/node-http/server.crt'),
	spdy:{
		protocols:['h2','spdy/3.1'],
		plain:false,
		'x-forwarded-for':true,
		connection:{
			windowSize: 1024 * 1024,
			autoSpdy31: false
		}
	}
};

var server = require('http').Server(app);
var spdy = require('spdy').createServer(options,app);
var io = require('socket.io')(server);
var ios = require('socket.io')(spdy);
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var port = Number(process.env.PORT || 8000);
var port2 = Number(process.env.PORT2 || 5000);
var positions = {};
var messages = {};
var latencies = {};

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

//serve our code
app.use('/',express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//session support
app.use(cookieParser());
app.use(session({secret: '123456789QWERTY',
                saveUninitialized: true,
                resave:true}));
//listening on connections
var control = require('./controllers/index.js')(positions, messages, latencies);
var routes = require('./routes')(app,control,io,ios,positions, messages, latencies);

spdy
.listen(port2,function() {
	console.log('http2 listening on -> '+port2);
});

server.listen(port,function () {
    console.log('listening on -> '+port);
});