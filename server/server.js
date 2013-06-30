var io = require('socket.io').listen(8001,{
	'log level': 2
});


io.sockets.on('connection', function (socket) {

	socket.on('subscribe', function (data) {

		socket.join(data.room);

		//store the room and the name on the socket
		socket.meta.room = data.room;
		socket.meta.name = data.name

		io.sockets.in(socket.meta.room).emit('userjoined',{'name':data.name});
	});

	socket.on('onmove', function (data) {
		io.sockets.in(socket.meta.room).emit('rendermove', data);
	});

	socket.on('disconnect', function() {
		console.log(socket.meta.name+' disconnected!');
		io.sockets.in(socket.meta.room).emit('userdisconnect',{'name':socket.meta.name});
	})

	//console.log(io.sockets.sockets);
	console.log('connected!');
});