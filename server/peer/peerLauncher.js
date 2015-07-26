var initPeer = function (){
	console.log('init peer yooooo');
	var socketioClient = require('socket.io-client');
	var tCollect = require('./tCollect');
	var config = require('./../conf');
	var Peer = require('./../classes/Peer');


	var me = new Peer(config.peer.name, config.peer.list_name, config.peer.keywords);

	var socket = socketioClient.connect('http://'+config.server.master_name+':'+config.server.peer_listen_port+'/peerConnection');

	var sendDataToMaster = function(extTweet){
		//JSON.stringify(extTweet,null,'\t');
		socket.emit('extTweet', extTweet);
	}

	tCollect.setOnTweetCallback(sendDataToMaster);
	tCollect.startCollectingTweets();

	//var socket = io.connect();

    socket.on('connect', function () {
      console.log("connected to master");

      socket.emit('peerInfo', me);

    });

    socket.on('updatePeer', function () {


    	console.log("connected to master");
    });
}



module.exports.initPeer = function(){
	initPeer();
}