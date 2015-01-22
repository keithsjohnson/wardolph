//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var twit = require('twit');
var tcollect = require('./tcollect');

tcollect.getSomeThings();
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//


var tweetData = null;

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, '../client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
   /* messages.forEach(function (data) {
      socket.emit('message', data);
      var test = {name:'jzTest1',text:'jzTest Message'+tweetData, tweet:tweetData};
      
      socket.emit('message', test);
    });
    */
    var collectedTData = tcollect.getTData();
    
    
    socket.emit('syncTData',collectedTData);
   

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
      });
    });
  });


function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Wardolph listening at", addr.address + ":" + addr.port);
});
