var express = require('express'),
app = express(),
server = require('http').Server(app),
io = require('socket.io')(server),
fs = require('fs'),
formidable = require('formidable'),
session = require('express-session'),
exec = require('child_process').exec,
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
util = require('util');

var files = {},
    positions = {},
    messages = {},
    total = 0,
    stack = 100;

var port = Number(process.env.PORT || 8000);

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
io.on('connection', function (socket) {
    socket
    .on('join',function (name) {
        console.log('Recibi join');
        socket.user = name;
        socket.broadcast.emit('announcement', socket.user +' join the room');
        //send the positions to everyone!
        socket.broadcast.emit('position',JSON.stringify(positions));
    })
    .on('message',function (msg,fn) {
        var date = Date.now();
        console.log('recibi message');
        //add messages for ajax client
        socket.broadcast.emit('message', socket.user, msg );
        fn(date);
    })
    .on('position',function (msg,fn) {
        //console.log('position(WS)');
        if(checkUser(socket)){
        positions[socket.user] = msg;
        //console.log(positions);
        socket.broadcast.emit('position', positions);
        fn(Date.now());
        }
    })
    .on('close',function () {
        console.log('recibi close');
        //erase user from every wsocket connected
        socket.broadcast.emit('close',socket.user);
        //erase position
        delete positions[socket.user];
        //inform users
        socket.broadcast.emit('announcement', socket.user +' left the room');

    })
    .on('start',function (data) {
        //start uploading
        console.log('recibi Start');
        var name = data['name'];
        var place=0;

        //start container
        files[name] = {
            fileSize: data['size'],
            data: "",
            downloaded: 0
        }

        try{
            //type of stat
            fs.stat(__dirname +'/public/Temp/' +  name, function (err,stats) {
                
                if(stats != undefined ){
                   //file exists on temp
                        files[name]['downloaded'] = stats.size;
                        place = stats.size / 524288;
                }
            });
            
            fs.stat(__dirname+"/public/Video/",function (err,stats) {

                if(stats == undefined){
                    fs.mkdir(__dirname+"/public/Video/", 0775);
                }
            });

        }catch(er){
            console.error(er);
        } 
        //New File
        fs.open(__dirname +"/public/Temp/" + name, "a", 0755, function(err, fd){
            if(err){
                console.log(err);
            }
            //store the file descriptor so we can write to it later
            files[name]['handler'] = fd;
            //first MoreData
            socket.emit('moreData', { 'place' : place, percent : 0 });

        });
    })
    .on('upload', function (data,fn){
        console.log('recibi upload');
        var name = data['name'];
        files[name]['downloaded'] += data['data'].length;
        files[name]['data'] += data['data'];
        //If File is Fully Uploaded
        if(files[name]['downloaded'] == files[name]['fileSize']){
            
            fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, writen){
                var inp = fs.createReadStream(__dirname +"/public/Temp/" + name);
                var out = fs.createWriteStream(__dirname +"/public/Video/" + name);
                
                inp.pipe(out);
                    
                fs.unlink(__dirname +"/public/Temp/" + name, function () { //This Deletes The Temporary File
                    //Moving File Completed
                    socket.emit('done', {'name' : name });
                    //});

                });
            });
        }
        //If the Data Buffer reaches 10MB
        else if(files[name]['data'].length > 10485760){ 
            fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, writen){
                files[name]['data'] = ""; //Reset The Buffer
                var place = files[name]['downloaded'] / 524288;
                var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
                socket.emit('moreData', { 'place' : place, 'percent' :  percent});
            });
        }else{
            var place = files[name]['downloaded'] / 524288;
            var percent = (files[name]['downloaded'] / files[name]['fileSize']) * 100;
            socket.emit('moreData', { 'place' : place, 'percent' :  percent});
        }
        fn(Date.now());
    })
});
//listening
app.get('/', function (req,res) {
    console.log('/ get');
    req.session.user.id = ++total;
    res.render('/index.html');
});

//cursor test
app.post('/position',function (req,res,next) {
    console.log('/position');
    if(req.session.user.id != undefined || req.session.user.id != 'undefined'){
    res.set('Content-type','text/plain');
    positions[req.session.user.id] = req.body;
    res.send(positions);
    }
});

//upload test
app.post('/',function  (req,res,next) {
    console.log('/ post');
    var form = new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        //res.set('Content-type','text/plain');
        //res.send(util.inspect({fields:fields, files:files}));
        res.redirect('/');
    });
    form.on('progress', function(bytesReceived, bytesExpected) {
          var progress = {
            type: 'progress',
            bytesReceived: bytesReceived,
            bytesExpected: bytesExpected
          };
          //console.log(JSON.stringify(progress));
    });

});

app.post('/latency',function (req,res,next) {
    //just for latency
    console.log('/latency');
    res.send(200);
});

app.post('/msg',function (req,res,next) {
    //get msg from user
    console.log('/msg');

    if(req.session.user.id != undefined || req.session.user.id != 'undefined'){
    messages[req.session.user.id] = req.body.msg;
    res.send(messages);
    }
    
});

app.all('/logout',function  (req,res,next) {
    console.log('/logout');
    delete positions[req.session.user.id];
    delete req.session;

});
//only for WS
function checkUser (socket) {
    if(socket.user == 'undefined' || socket.user == undefined){
        socket.disconnect();
        return false;
    }
    return true;
}

server.listen(port,function () {
    console.log("listening on >"+port);
});