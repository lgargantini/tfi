'use strict';
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var port = Number(process.env.PORT || 8000);
var positions = {};
var messages = {};
var files = {};


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
var control = require('./controllers/index.js')(positions, messages, files);
var routes = require('./routes')(app,control,io,positions, messages,files);

server.listen(port,function () {
    console.log('listening on -> '+port);
});