//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//



//var async = require('async');
var socketio = require('socket.io');

var express = require('express');

var config = require('./conf');
var master = require('./master/master');
var peer = require('./peer/peer');


if(config.server.my_type == 'master'){
  master.initMaster(express, socketio);
}

if(config.server.my_type == 'peer'){
  peer.initPeer();
}



if(!config.server.production && config.server.my_type == 'dev' ){
  console.log('initializing dev');
  
  var portInUse = function(port,callback){

    var router = express();
    var http      = require('http');
    var server = http.createServer(router);

    server.once('error', function(err) {
      if (err.code === 'EADDRINUSE') {
        // port is currently in use
        
        callback('EADDRINUSE');
      }
    });

    server.once('listening', function() {
      // close the server if listening doesn't fail
      server.close();
      callback();
      
    });

    server.listen(port);

  }
  
  var initServerIfPortFree = function(port){
      portInUse(port,function(err){
        if(err){
          initServerIfPortFree(port+1);
        }
        else if(port==config.server.master_port){//master port available init master
          master.initMaster(express, socketio);
        }
        else{//port available init client.. can have mutiple clients
          peer.initPeer();
        }
          
        
      });
  }

  var port = config.server.master_port;
  initServerIfPortFree(port);

}


