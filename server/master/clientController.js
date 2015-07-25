
var Client = require('./../classes/Client');


var clients = {};
var clientSocketMap = {};

var setClient = function(socket, data) {
	removeClient(socket);
	var name = data.getSyncData.pageTitle;
	var client = new Client(name, socket);
	if(typeof(clients[name]) == 'undefined'){
		clients[name] = [];
	}
	clients[name].push(client);
	clientSocketMap[socket.id] = client;
}

var removeClient = function(socket) {
	var client = clientSocketMap[socket.id];
	if(client){
		clients[client.name].splice(clients[client.name].indexOf(client) , 1);//deleting from array
		delete clientSocketMap[socket.id];//deleting from object map
	}
}

exports.getClientById = function(socketId) {
	return clientSocketMap[socketId];
}

exports.getClientsByName = function(name) {
	return clients[name];
}

exports.emit = function(clientName, eventName, tData) {
	var clientsByName = clients[clientName];
	if(clientsByName){
		for(var i=0; i<clientsByName.length; i++){
			clientsByName[i].socket.emit(eventName,tData);
		}
	}
}

exports.setClient = setClient;
exports.removeClient = removeClient;