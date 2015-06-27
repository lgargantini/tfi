'use strict';
module.exports = function (app, controller, io, positions, messages, files, latencies) {
var fs = require('fs');
//listening
app.get('/', controller.general.index);

app.get('/msg',controller.message.get);
app.post('/msg',controller.message.post);

//cursor test
app.get('/position',controller.position.get);
app.post('/position',controller.position.post);

//upload test
app.post('/', controller.upload.post);
app.get('/upload',controller.upload.get);

//latency test
//app.post('/latency', controller.general.latency);
app.get('/latency', controller.latency.get);
app.post('/latency', controller.latency.post);
app.get('/latency/all', controller.latency.latencyAll);

app.all('/clear',controller.general.clear);


io.on('connection', function (socket) {
    console.log('new!');
    socket
    .on('join',function wsJoin(name) {
        
        console.info('Recibi join');
        socket.user = name;
        socket.broadcast.emit('announcement', socket.user +' join the room');
        //send the positions to everyone!
        socket.broadcast.emit('position', positions);
    })
    .on('message',function wsMsg(msg,fn) {
        console.info('recibi message');
        console.log(msg);
       
        var m = {
            date: msg.date,
            usr: socket.user,
            msg: msg.msg            
        };
        messages[msg.date] = m;

        //broadcast message on ws
        socket.broadcast.emit('message', socket.user, msg );
        fn('bg-success');
    })
    .on('latency',function wsLat(msg) {
        console.info('recibi latency');
    
        var l = {
            date: msg.date,
            usr: socket.user,
            lat: msg.lat,
            test: msg.msg            
        };
        latencies[msg.date] = l;
        console.log(latencies);
        //broadcast message on ws
        socket.broadcast.emit('latency', socket.user, msg );
        //fn('bg-success');
    })
    .on('position',function wsPos(msg,fn) {
        if(checkUser(socket)){
        positions[socket.user] = msg;
        socket.broadcast.emit('position', positions);
        fn('bg-info');
        }
    })
    .on('close',function wsClose() {
        console.info('recibi close');
        //erase user from every wsocket connected
        socket.broadcast.emit('close',socket.user);
        //erase position
        delete positions[socket.user];
        //inform users
        socket.broadcast.emit('announcement', socket.user +' left the room');
    })
    .on('start', function wsStart(data) {
        //start uploading
        console.info('recibi Start');
        var name = data.name;
        var place=0;

        //start container
        files[name] = {
            fileSize: data.size,
            data: '',
            downloaded: 0
        };

        try{
            //type of stat
            console.log('__dirname'+__dirname);
            fs.stat(__dirname+'/Temp/',function (err,stats) {
                if(stats === undefined){
                    console.log('creando carpeta Temp');
                    fs.mkdir(__dirname+'/Temp/', '0775');
                }
            });
            fs.stat(__dirname+'/Video/',function (err,stats) {
                if(stats === undefined){
                    console.log('creando carpeta Video');
                    fs.mkdir(__dirname+'/Video/', '0775');
                }
            });
            fs.stat(__dirname +'/Temp/' +  name, function (err,stats) {
                if(stats !== undefined){
                    //file exists on temp
                    files[name].downloaded = stats.size;
                    place = stats.size / 524288;
                }
            });

        }catch(er){
            console.error(er);
        } 
        //New File
        fs.open(__dirname +'/Temp/' + name, 'a', '0755', function(err, fd){
            if(err){
                console.error(err);
            }
            //store the file descriptor so we can write on it later
            files[name].handler = fd;
            //first MoreData
            socket.emit('moreData', { 'place' : place, percent : 0 });
        });
    })
    .on('upload', function wsUpload(data, fn){
        
        console.info('recibi upload');
        console.log(data.name);
        console.log(data.data.length);
        var name = data.name;
        files[name].downloaded += data.data.length;
        files[name].data += data.data;
        //If File is Fully Uploaded
        if(files[name].downloaded == files[name].fileSize){
            
            fs.write(files[name].handler, files[name].data, null, 'binary', function(){
                var inp = fs.createReadStream(__dirname +'/Temp/' + name);
                var out = fs.createWriteStream(__dirname +'/Video/' + name);
                
                inp.pipe(out);
                    
                fs.unlink(__dirname +'/Temp/' + name, function () { //This Deletes The Temporary File
                    //Moving File Completed
                    socket.emit('done', {'name' : name });
                    //});

                });
            });
        }
        //If the Data Buffer reaches 10MB
        else if(files[name].data.length > 10485760){
            console.log(files[name].handler);
            console.log(files[name].data.length);
            fs.write(files[name].handler, files[name].data, null, 'binary', function(){
                files[name].data = ''; //Reset The Buffer
                var place = files[name].downloaded / 524288;
                var percent = (files[name].downloaded / files[name].fileSize) * 100;
                socket.emit('moreData', { 'place' : place, 'percent' :  percent});
            });
        }else{
            var place = files[name].downloaded / 524288;
            var percent = (files[name].downloaded / files[name].fileSize) * 100;
            socket.emit('moreData', { 'place' : place, 'percent' :  percent});
        }
        fn('bg-info');
    });

//only for WS
function checkUser (socket) {
    
    if(socket.user === 'undefined' || socket.user === undefined){
        socket.disconnect();
        return false;
    }
    return true;
}
}); 
};