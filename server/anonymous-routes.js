var express = require('express'),
    quoter  = require('./quoter'),
    filterKeysController  = require('./filterKeysController');

var app = module.exports = express.Router();

app.get('/api/random-quote', function(req, res) {
  res.status(200).send(quoter.getRandomOne());
});


app.get('/api/sentimentAnalysis/filterDataKeys', function(req, res) {
	console.log('filterDataKeys requested: '+req.query.topic);
 	res.status(200).send(filterKeysController.getKeywords(req.query.topic));
});