var initMaster = function (express, socketio){

	var path 			= require('path');
	var http 			= require('http');
	var bodyParser      = require('body-parser');
	var errorhandler    = require('errorhandler');
  var cors            = require('cors');
  var tread 			= require('./tread');
  var config 			= require('./../conf');
  var peerController      = require('./peerController');

  var router = express();

	console.log("jzTest master initialized");
	// Parsers
	//express.use(bodyParser.urlencoded());
	router.use(bodyParser.json());
	router.use(cors());

	router.use(function(err, req, res, next) {
	  if (err.name === 'StatusError') {
	    res.send(err.status, err.message);
	  } else {
	    next(err);
	  }
	});

	if (!config.server.production) {
	  //router.use(express.logger('dev'));
	  router.use(errorhandler())
	}
	

	router.use(require('./anonymous-routes'));
	router.use(require('./protected-routes'));
	router.use(require('./user-routes'));

    
    var server = http.createServer(router);

    var peerListenerServer = http.createServer(router);
    var io = socketio.listen(server);
    var peerIO = socketio.listen(peerListenerServer).of('/peerConnection');

    router.use(express.static(path.resolve(__dirname, '../client')));

    /*router.get('/admin', function(req, res) {
     //res.send('/admin.html');
     res.sendFile('/admin.html', {root: path.resolve(__dirname, '../client')});
    });*/

    var messages = [];
    var sockets = [];

    peerIO.on('connection', function(peerSocket){
      console.log('a peer connected');

      peerSocket.on('peerInfo', function (data) {
        console.log("peer info: ",data);
        peerController.setPeer(data);
      });

      peerSocket.on('tweet', function (data) {
        //TODO draw this dat on map
        //TODO save it in aggregation tables.
        console.log('tweet received:' + data);
      });

    });

    tread.initData();
    io.on('connection', function (socket) {

        console.log('event connection');

        socket.on('getSyncData', function(data){
          console.log('event getSyncData: '+data.getSyncData.pageTitle);
          var tData = tread.getTData(data.getSyncData.pageTitle);
          socket.emit('syncTData',tData);
        });

        sockets.push(socket);//sockets is list of open connections with clients. Number of open connections equals number of clients.

        socket.on('disconnect', function () {
          sockets.splice(sockets.indexOf(socket), 1);
        });

    });

    
 
    server.listen(config.server.master_port, process.env.IP || "0.0.0.0", function(){
      var addr = server.address();
      console.log("Wardolph listening at", addr.address + ":" + addr.port);
    });

    peerListenerServer.listen(config.server.peer_listen_port, process.env.IP || "0.0.0.0", function(){
      var addr = peerListenerServer.address();
      console.log("Wardolph listening for peers at", addr.address + ":" + addr.port);
    });
}

module.exports.initMaster = function(express, socketio){
	initMaster(express, socketio);
}