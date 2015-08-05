
var Client = require('./../classes/Client');
var Coordinates = require('./../classes/Coordinates');
var ExtendedTweet = require('./../classes/ExtendedTweet');
var timeZoneHelper = require('./../utils/timeZoneHelper');
var sntApi = require('sentiment');

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

var emit = function(clientName, eventName, tData) {
	var clientsByName = clients[clientName];
	if(clientsByName){
		for(var i=0; i<clientsByName.length; i++){
			clientsByName[i].socket.emit(eventName,tData);
		}
	}
}

var sendTweetData = function(clientName, extTweetJson){
	var extTweet = new ExtendedTweet(extTweetJson.title, extTweetJson.queryParam, extTweetJson.date, extTweetJson.type, extTweetJson.tweet);
	var eventName = 'extTweet';
	var tweet = extTweet.tweet;
	if(tweet!=null && typeof(tweet)!='undefined'){
		var sentiment = sntApi(tweet.text);
		if(sentiment.words.length>0){
			if( tweet.coordinates!=null && typeof(tweet.coordinates) != 'undefined'){
				var lat = tweet.coordinates.coordinates[1];
				var lng = tweet.coordinates.coordinates[0];
				var coordinates = new Coordinates(lat, lng);
				extTweet.setCoordinates(coordinates);
			}
			else if(typeof(tweet.user.time_zone) != 'undefined' && tweet.user.time_zone!=null){
				var timeZoneName = extTweet.tweet.user.time_zone;
				var timezoneFound = timeZoneHelper.findTimeZoneByName(timeZoneName);
				if(timezoneFound){
					extTweet.setCoordinates(timezoneFound.coordinates);
				}
			}

			extTweet.setSentiment(sentiment);

			if(extTweet.coordinates){
				emit(clientName,eventName,extTweet);
			}
			
			

		}
		
	}
	
}

exports.setClient = setClient;
exports.removeClient = removeClient;
exports.emit = emit;
exports.sendTweetData = sendTweetData;