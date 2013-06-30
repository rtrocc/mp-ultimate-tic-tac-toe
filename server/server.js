var io = require('socket.io').listen(8001,{
	'log level': 2
});

var rooms = {};

io.sockets.on('connection', function (socket) {

	socket.meta = {};

	socket.on('subscribe', function (data) {


		if(rooms[data.room]){
			if(rooms[data.room].playerList.length >= 2){
				socket.emit('error', {'errorType':'fullroom'});
				return;
			}
			rooms[data.room].playerList.push(data.name);
		}else{
			rooms[data.room] = {
				playerList : []
			};
			rooms[data.room].playerList.push(data.name);
		}

		console.log(rooms[data.room].playerList);

		socket.join(data.room);

		//store the room and the name on the socket
		socket.meta.room = data.room;
		socket.meta.name = data.name

		io.sockets.in(socket.meta.room).emit('userjoined',{'name':data.name,'playerList':rooms[data.room].playerList});
	});

	socket.on('onmove', function (data) {
		io.sockets.in(socket.meta.room).emit('rendermove', data);
	});

	socket.on('disconnect', function() {
		console.log(socket.meta.name+' disconnected!');
		if(rooms[socket.meta.room]){
			for(i in rooms[socket.meta.room].playerList){
				if(rooms[socket.meta.room].playerList[i] == socket.meta.name){
					rooms[socket.meta.room].playerList.splice(i,1);
				}
			}	
		}
		io.sockets.in(socket.meta.room).emit('userdisconnect',{
			'name': socket.meta.name,
			'playerList': (rooms[socket.meta.room]?rooms[socket.meta.room].playerList:false)
		});
	})

	socket.on('connect', function() {
		
	})

	//console.log(io.sockets.sockets);
	console.log('connected!');
});