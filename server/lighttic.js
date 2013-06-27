var io = require('socket.io').listen(8001,{
	'log level': 2
});

var gameKeeper = {};

io.sockets.on('connection', function (socket) {

  socket.on('onmove', function (data) {
	console.log('recieved move coords!');
    io.sockets.in(socket.room).emit('rendermove', data);
  });

  socket.on('subscribe', function (data) {
    socket.join(data.room);
	//store the room and the name on the socket!
	socket.room = data.room;
	socket.name = data.name
	console.log('joined room '+data.room);
	io.sockets.in(socket.room).emit('userjoined',{'name':data.name});
  });

  socket.on('disconnect', function() {
	  io.sockets.in(socket.room).emit('userdisconnect',{'name':socket.name});
  })

	console.log(io.sockets.sockets);
  console.log('connected!');
});
