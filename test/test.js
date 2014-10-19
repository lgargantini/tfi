var should = require('should');
var io = require('socket.io-client');
var socketURL = 'http://localhost:8000';

var options ={
	transports: ['websocket'],
	'force new connection': true
};

var chatUser1 = {'name':'Pepe'};
var chatUser2 = {'name':'Pedro'};
var chatUser3 = {'name':'Jose'};

describe("TFI Server",function(){

	it('Should broadcast user join to all users', 
		function(done){
			var client1 = io.connect(socketURL, options);

			client1.on('connect', function(data){
			client1.emit('join', chatUser1.name);
    /* Since first client is connected, we connect
		    the second client. */
		    var client2 = io.connect(socketURL, options);
		    client2.on('connect', function(data){
		    	client2.emit('join', chatUser2.name);
		    });

			});

			var numUsers = 0;
			client1.on('announcement', function(usersName){
				numUsers += 1;

				if(numUsers === 1){
					usersName.should.equal(chatUser2.name + " join the room");
					client1.disconnect();
					done();
				}
			});
		});

	it('Should be able to broadcast messages', function(done){
		var client1, client2, client3;
		var message = 'Hello World';
		var initMsj = Date.now();
		var messages = 0;

		var checkMessage = function(client){
			client.on('message', function( from, msgcomp){
				message.should.equal(msgcomp.msg);
				chatUser2.name.should.equal(from);
				client.disconnect();
				messages++;
				if(messages === 2){
					done();
				};
			});
		};
//connect client1
		client1 = io.connect(socketURL, options);
		checkMessage(client1);
//when is ready join
		client1.on('connect', function(data){
			client1.emit('join', chatUser1.name);
			//connect client2
			client2 = io.connect(socketURL, options);
			checkMessage(client2);
				//when is ready join
				client2.on('connect', function(data){
				client2.emit('join', chatUser2.name);
				
				//connect client3
				client3 = io.connect(socketURL, options);
				checkMessage(client3);
					//when is ready join
				client3.on('connect', function(data){
				client3.emit('join', chatUser3.name);
				//all client connected, client2 emit broadcast
					client2.emit('message', 
						{'msg': message, 'date': initMsj },
						function (status) {
						'bg-success'.should.equal(status);
					});
				});
			});
		});
	});

it('Should be able to broadcast positions on join', function(done){
		var client1, client2, client3;
		var positions = {};
		var check = 0;
		var checkPosition = function(client){
			client.on('position', function(pos){
				for(var id in pos){
					positions.should.equal(pos[id]);
				}
				client.disconnect();
				check++;
				if(check === 2){
					done();
				};
			});
		};

		client1 = io.connect(socketURL, options);
		checkPosition(client1);

		client1.on('connect', function(data){
		client1.emit('join', chatUser1.name);
				client2 = io.connect(socketURL, options);
				checkPosition(client2);

				client2.on('connect', function(data){
				client2.emit('join', chatUser2.name);
					
					client3 = io.connect(socketURL, options);
					checkPosition(client3);

					client3.on('connect', function(data){
					client3.emit('join', chatUser3.name);
				});
			});
		});
	});


});