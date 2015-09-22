var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var user_table = new Array();

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log('a user connected');
  for(key in user_table) {
  	socket.emit('player', key+' '+user_table[key].position);
  }
  socket.on('new', function(id) { new_connection(id, socket) });
  socket.on('location', function(location) { new_location(location) });
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});

function new_connection(id, socket){
	// add the user to the user_table
	user_table[id] = {'socket':socket};
	// tell others about the user
	io.emit('player', id+' 10 20 40');
}

function new_location(location){
	var tok = location.split(' ');
	// store where they are
	user_table[tok[0]].position = tok[1]+' '+tok[2]+' '+tok[3];
	// let everyone else know where they are
	console.log(location); 
	for(key in user_table) {
		user_table[key].socket.emit('location', location);
	}
}