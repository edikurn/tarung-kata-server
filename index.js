const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors : {origin : '*'}})

const port = 3001;

server.listen(port, () => {
	console.log('server is running...')
})

let rooms = [];
// let myRoomName;

io.on('connection', (socket) => {

	console.log('user connected ' + socket.id);

	socket.on('join', (room) => {
		socket.join(room);
		rooms.push({name : room, id : socket.id});
		io.emit('update room', rooms);
	});

	socket.on("invite", (data) => {
		socket.to(data.invited).emit("want to play?", data);
	})

	socket.on('invitation-accapted', (data) => {
		socket.to(data.inviter).emit('invitation-accapted', data)
	})

	socket.on('invitation-rejected', (data) => {
		socket.to(data.inviter).emit('invitation-rejected', data)
	})

	socket.on('invitation-rejected-because-playing-with-other', (data) => {
		socket.to(data.inviter).emit('invitation-rejected-because-playing-with-other', data)
	})

	socket.on('delete room', (room) => {
		let deletedIndex = rooms.map(set => set.name).indexOf(room);
		rooms.splice(deletedIndex,1);
		io.emit('update room', rooms); 
	})

	socket.on('keyup-to-enemy', (data) => {
		socket.to(data.enemy).emit('keyup-from-enemy', data.key)
	})

	socket.on('send-begin-word-to-enemy', (data) => {
		socket.to(data.enemy).emit('receive-begin-word-from-enemy', data)
	})

	socket.on('my-enemy-win', myEnemy => {
		socket.to(myEnemy).emit('you-win')
	})

	socket.on("disconnect", (reason) => {
		rooms = rooms.filter(room => room.id !== socket.id);
		io.emit('update room', rooms); 
	})
})