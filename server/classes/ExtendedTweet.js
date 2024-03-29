var ExtendedTweet = function (title, queryParam, date, type, tweet){
        this.title = title;
        this.queryParam = queryParam;
        this.date = date;
        this.type = type;
        this.tweet = tweet;
    }

ExtendedTweet.prototype.setSentiment = function(sentiment){
	this.sentiment = sentiment;
}

ExtendedTweet.prototype.setCoordinates = function(coordinates){
	this.coordinates = coordinates;
}

ExtendedTweet.prototype.setTopic = function(topic){
	this.topic = topic;
}

module.exports = ExtendedTweet;