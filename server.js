'use strict';
var express = require('express');
var app = express();
var fs = require('fs');
var optH2 = {
	key:fs.readFileSync(__dirname + '/node-http/privkey.pem'),
	cert:fs.readFileSync(__dirname + '/node-http/fullchain.pem'),
	ca:fs.readFileSync(__dirname + '/node-http/chain.pem'),
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
var optH1s = {
	key:fs.readFileSync(__dirname + '/node-http/privkey.pem'),
        cert:fs.readFileSync(__dirname + '/node-http/fullchain.pem'),
        ca:fs.readFileSync(__dirname + '/node-http/chain.pem')
};

var h1 = require('http').Server(app);
var h1s = require('https').createServer(optH1s,app);
var h2 = require('spdy').createServer(optH2,app);

var io = require('socket.io')(h1);
var ios = require('socket.io')(h1s);

var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var port = Number(process.env.PORT || 8000);
var port2 = Number(process.env.PORT2 || 443);
var port3 = Number(process.env.PORT3 || 5000);

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

h1s.listen(port,function () {
    console.log('https h1 listening on -> '+port);
});

h2
.listen(port2,function() {
	console.log('https h2 listening on -> '+port2);
});

h1.listen(port3, function() {
	console.log('http h1 listening on ->'+port3);
});
