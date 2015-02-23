// requires express and stores it in the express variable
var express = require("express");
// requires path and stores it in the path variable 
// What does path do? -- makes life easier with path.join
var path = require("path");

// instantiates the express application
var app = express();

// track our data we need to keep track of messages and users
var messages = [];
var users = {};

// sets the views directory to be __dirname+/views
app.set('views', path.join(__dirname, "./views"));

// set the view engine
app.set('view engine', 'ejs');

// responds to the route GET /
app.get('/', function(req, res) {
	res.render('index');
})

// telling our app to listen (create a server with our rules specified above) on port 8000 
var server = app.listen(8000, function() {
	console.log("listening");
})

// sets up sockets requires socket.io and tells it what server to use
var io = require('socket.io').listen(server);

// sets up the connection event for all sockets 
io.sockets.on('connection', function(socket) {
	// console.log(socket); // uncomment at your own risk!
	console.log("hello we are using sockets");

	// handling the new_user event (listening)
	socket.on("new_user", function(data) {
		// keeping track of the user
		users[socket.id] = data.name;
		// emitting intial messages to the new user
		socket.emit("initial_messages", {messages: messages});
		// creating a message for everyone else 
		var new_message = data.name + " has joined the chat!";
		messages.push(new_message);
		console.log(messages);
		// and broadcasting it
		socket.broadcast.emit("user_connected", {message: new_message});
	})
	// handling the message submit event (listening)
	socket.on("message_submit", function(data) {
		messages.push(data.message);
		// broadcasting the message to everyone
		io.emit("new_message", {message: data.message});
	})
	// handling the disconnect
	socket.on("disconnect", function() {
		var new_message = users[socket.id] + " has disconnected!";
		// broadcasting the user_disconnect event
		socket.broadcast.emit("user_disconnected", {message: new_message});
	})
	// this is where we can use sockets
})





// 1. Serve up the view index.ejs and connect to sockets

// 2. Connect to sockets from view and recieve the connection event on the server side

// 3. Prompt for user name on the client-side and then EMIT "new_user" event to server with user's name

// 4. Server listens for "new_user" event -- save message with new user connect message

// 5. Server BROADCASTS "user_connected" event to all but one and sends along the message

// 6. Server keeps track of messages via array of strings

// On button click client EMITS "message_submit" to server with message text

// 7. Server listens for "message_submit" event -- save message with user to array of messages

// 8. Server BROADCASTS "new_message" event -- append message to chat