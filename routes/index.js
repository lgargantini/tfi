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

//latency test
app.get('/latency', controller.latency.get);
app.post('/latency', controller.latency.post);
app.get('/latency/all', controller.latency.latencyAll);

app.all('/clear',controller.general.clear);


io.on('connection', function (socket) {
    console.info('new!');
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
        console.info(msg);
        
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
            test: msg.test            
        };
        latencies[msg.date] = l;
        console.info(latencies);
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
    });

//only for WS
function checkUser (socket) {
    return socket.user === 'undefined' || socket.user === undefined;
}

}); 
};