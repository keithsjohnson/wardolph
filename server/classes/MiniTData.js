var Coordinates = require('./Coordinates');

var MiniTData = function (lat, lng, topic){
	this.coordinates = new Coordinates(lat,lng);
	this.tweetCount = 0;
	this.averageSentiment = 0;
	this.topic = topic;
}

MiniTData.prototype.setAverageSentiment = function(averageSentiment){
	this.averageSentiment = averageSentiment;
}

MiniTData.prototype.setTweetCount = function(tweetCount){
	this.tweetCount = tweetCount;
}

module.exports = MiniTData;