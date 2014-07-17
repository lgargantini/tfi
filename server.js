var express = require('express'),
app = express(),
http = require('http'),
server = http.createServer(app),
io = require('socket.io').listen(server),
fs = require('fs'),
exec = require('child_process').exec,
util = require('util');

var files = {},
    positions = {},
    total = 0,
    stack = 100;
//serve our code
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());
//session support
app.use(express.cookieParser());
app.use(express.session({secret: '123456789QWERTY'}));
//listening on connections

io.on('connection', function (socket) {
    socket
    .on('join',function (name) {
        console.log('Recibi join');
        socket.username = name;
        socket.id = total++;
        socket.broadcast.emit('announcement', socket.username +' join the room');
        //send the positions of everyone!
        socket.broadcast.emit('position',JSON.stringify(positions));
    })
    .on('message',function (msg,fn) {
        console.log('recibi message');
        socket.broadcast.emit('message', socket.username, msg );
        fn(Date.now());
	})
    .on('position',function (msg) {

        positions[socket.id] = msg;
        //console.log(positions);
        socket.broadcast.emit('position', positions);
    })
    .on('close',function () {
        console.log('recibi close');
        //erase user from every wsocket connected
        socket.broadcast.emit('close',socket.id);
        //inform users
        socket.broadcast.emit('announcement', socket.username +' left the room');
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
			var stat = fs.stat(__dirname +'/public/Temp/' +  name);
			if(stat.isFile()){
				files[name]['downloaded'] = stat.size;
				place = stat.size / 524288;
			}
        }catch(er){} 
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
	.on('upload', function (data){
        console.log('recibi upload');
		var name = data['name'];
		files[name]['downloaded'] += data['data'].length;
		files[name]['data'] += data['data'];
        //If File is Fully Uploaded
        if(files[name]['downloaded'] == files[name]['fileSize']){
            fs.write(files[name]['handler'], files[name]['data'], null, 'binary', function(err, writen){
                var inp = fs.createReadStream(__dirname +"/public/Temp/" + name);
                var out = fs.createWriteStream(__dirname +"/public/Video/" + name);
                util.pump(inp, out, function(){
                    fs.unlink(__dirname +"/public/Temp/" + name, function () { //This Deletes The Temporary File
                    //Moving File Completed
                    //exec('vlc public/Video/'+name , function (err) {
                    socket.emit('done', {'name' : name });
                    //});

                    });
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

    })
});
//listening
app.post('/position',function (req,res,next) {
//console.log(req);
//primera vez que ingreso
    if(req.session.user == undefined){
        console.log('nuevo req.session.user');
        req.session.user = stack++;
    }
    res.set('Content-type','text/plain');
    //console.log(req.xhr);
    positions[req.session.user] = req.body;
    res.send(positions);
});

server.listen(8000);