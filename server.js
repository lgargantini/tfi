var express = require('express'),
app = express(),
http = require('http'),
server = http.createServer(app),
io = require('socket.io').listen(server),
fs = require('fs'),
exec = require('child_process').exec,
util = require('util');

var Files = {};

//serve our code
app.use(express.static('public'));
//listening on connections

io.on('connection', function (socket) {
	socket
	.on('message',function (msg) {
        console.log('recibi message');
		console.log('got :');
        console.log(msg);
		socket.emit('message',{'msg': 'pong!'});
	})
	.on('Start',function (data) {
        //start uploading
        console.log('recibi Start');
		var Name = data['Name'];
		Files[Name] = {
			FileSize: data['Size'],
			Data: "",
			Downloaded: 0
		}
		var Place=0;
		try{
            //type of stat
			var Stat = fs.statSync(__dirname +'/Temp/' +  Name);
			if(Stat.isFile())
			{
				Files[Name]['Downloaded'] = Stat.size;
				Place = Stat.size / 524288;
			}
		}
        catch(er){} 
        
        //New File
        fs.open(__dirname +"/Temp/" + Name, "a", 0755, function(err, fd){
            if(err){
                console.log(err);
            }else
            {
                Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                socket.emit('MoreData', { 'Place' : Place, Percent : 0 });
            }
        });
    })
	.on('Upload', function (data){
        console.log('recibi Upload');
		var Name = data['Name'];
		Files[Name]['Downloaded'] += data['Data'].length;
		Files[Name]['Data'] += data['Data'];
        if(Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
        {
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                //Get Thumbnail Here
                var inp = fs.createReadStream(__dirname +"/Temp/" + Name);
                var out = fs.createWriteStream(__dirname +"/Video/" + Name);
                util.pump(inp, out, function(){
                    fs.unlink(__dirname +"/Temp/" + Name, function () { //This Deletes The Temporary File
                    //Moving File Completed
                    exec("ffmpeg -i Video/" + Name  + " -ss 01:30 -r 1 -an -vframes 1 -f mjpeg Video/" + Name , function(err){
                                socket.emit('Done', {'Image' : 'Video/' + Name });
                            });
                    });
                });
            });
        }
        else if(Files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
            fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function(err, Writen){
                Files[Name]['Data'] = ""; //Reset The Buffer
                var Place = Files[Name]['Downloaded'] / 524288;
                var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
                socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
            });
        }
        else
        {
            var Place = Files[Name]['Downloaded'] / 524288;
            var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
            socket.emit('MoreData', { 'Place' : Place, 'Percent' :  Percent});
        }

    })
});
//listening
server.listen(8000);