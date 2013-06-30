var io = require('socket.io').listen(8001,{
	'log level': 2
});

io.sockets.on('connection', function (socket) {

	socket.on('subscribe', function (data) {

		socket.join(data.room);

		//store the room and the name on the socket
		socket.room = data.room;
		socket.name = data.name

		console.log(data.name + ' joined the room '+data.room);
		io.sockets.in(socket.room).emit('userjoined',{'name':data.name});
	});

	socket.on('onmove', function (data) {
		io.sockets.in(socket.room).emit('rendermove', data);
	});

	socket.on('disconnect', function() {
		console.log(socket.name+' disconnected!');
		io.sockets.in(socket.room).emit('userdisconnect',{'name':socket.name});
	})

	//console.log(io.sockets.sockets);
	console.log('connected!');
});