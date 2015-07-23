var express = require('express'),
    jwt     = require('express-jwt'),
    //config  = require('./config'),
    quoter  = require('./quoter');
var peerController 			= require('./peerController');
var config 			= require('./../conf');

var app = module.exports = express.Router();

var jwtCheck = jwt({
  secret: config.jwtSecret
});

app.use('/api/protected', jwtCheck);
app.use('/peerConnection', jwtCheck);

app.get('/api/protected/random-quote', function(req, res) {
  res.status(200).send(quoter.getRandomOne());
});

app.get('/api/protected/peers', function(req, res) {
  res.status(200).send(peerController.getPeers());
});



app.post('/api/protected/peers', function(req, res) {
	console.log("jztest",req.body);
	peerController.setPeers(req.body);
	res.status(200).send(peerController.getPeers());
  

  /*if (!user.password === req.body.password) {
    return res.status(401).send("The username or password don't match");
  }*/

  /*res.status(201).send({
    id_token: createToken(user)
  });*/
});