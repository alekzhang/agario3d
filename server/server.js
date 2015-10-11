var express = require('express');
var app = express();
app.get('/', function(req,res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/*', function(req,res) {
  var file = req.params[0];
  res.sendFile(__dirname + '/public/' + file);
});
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var user_count = 0;
var user_table = new Array();

io.on('connection', function(socket){
  console.log('a user connected');
  var player_id = '';
  for(key in user_table) {
  	console.log('user_table has ' + key + ' ' + user_table[key]);
  	socket.emit('player', key+' '+user_table[key].position+' '+user_table[key].it);
  }
  socket.on('new', function(id) { player_id = id.split(' ')[0]; new_connection(id, socket); });
  socket.on('location', function(location) { new_location(location) });
  socket.on('disconnect', function() {
  	console.log('a user disconnected');
  	io.emit('disconnect', player_id);
  	delete user_table[player_id];
  	console.log('deleting ' + player_id);
  	user_count--;
  })
});
server.listen(8080);
function new_connection(id_location, socket){
	var toks = id_location.split(' ');
	var id = toks[0];
	var position = toks[1]+' '+toks[2]+' '+toks[3];
	// add the user to the user_table
	user_table[id] = {'socket':socket, 'position':position, it:false};
	user_count++;
	// if user is first, they're it!
	if(user_count == 1) {
		user_table[id].it = true;
		socket.emit('it', id);
	}
	// tell others about the user
	io.emit('player', id+' '+position+' '+user_table[id].it);
}

function new_location(id_location){
	var tok = id_location.split(' ');
	// store where they are
	user_table[tok[0]].position = tok[1]+' '+tok[2]+' '+tok[3];
	// let everyone else know where they are
	for(key in user_table) {
		user_table[key].socket.emit('location', id_location);
	}
	return tok[0];
}
