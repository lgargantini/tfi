'use strict';
var express = require('express');
var app = express();
var fs = require('fs');
var options = {
	key:fs.readFileSync(__dirname + '/node-http/server.key'),
	cert:fs.readFileSync(__dirname + '/node-http/server.crt')
};
var server = require('http').Server(app);
var spdy = require('spdy').createServer(options, app);
var io = require('socket.io')(server);
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var port = Number(process.env.PORT || 8000);
var port2 = Number(process.env.PORT2 || 5000);
var positions = {};
var messages = {};
var files = {};
var latencies = {};

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
var control = require('./controllers/index.js')(positions, messages, files, latencies);
var routes = require('./routes')(app,control,io,positions, messages,files, latencies);

spdy
.listen(port2, function () {
	console.log('http/2 listening on ->'+port2)
});

server.listen(port,function () {
    console.log('http/1.x - ws listening on -> '+port);
});