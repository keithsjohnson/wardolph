var timeZoneHelper = require('./timeZoneHelper');
var sntApi = require('sentiment');
var Coordinates = require('./../classes/Coordinates');

var findTopic = function(tweet, filterData){
    var text = tweet.text;
    for (key in filterData) {
        var filterArr = filterData[key];
        for (var i = 0; i < filterArr.length; i++) {
            var match = text.match(new RegExp(filterArr[i], "i"));
            if(match) {
                return key;
            }
        };
    }
    if(tweet.entities.urls.length > 0){
        
        var url = tweet.entities.urls[0].expanded_url;
        //console.log("found url: "+url);
        for (key in filterData) {
            var filterArr = filterData[key];
            for (var i = 0; i < filterArr.length; i++) {
                var match = url.match(new RegExp(filterArr[i], "i"));
                if(match) {
                    //console.log("url topic: "+key);
                    return key;
                }
            };
        }
    }
    return 'all';
}

var findCoordinates = function(tweet){

	if( tweet.coordinates!=null && typeof(tweet.coordinates) != 'undefined'){
		var lat = tweet.coordinates.coordinates[1];
		var lng = tweet.coordinates.coordinates[0];
		var coordinates = new Coordinates(lat, lng);
		return coordinates
		//extTweet.setCoordinates(coordinates);
	}
	else if(typeof(tweet.user.time_zone) != 'undefined' && tweet.user.time_zone!=null){
		var timeZoneName = tweet.user.time_zone;
		var timezoneFound = timeZoneHelper.findTimeZoneByName(timeZoneName);
		if(timezoneFound){
			return timezoneFound.coordinates;
		}
	}

	return undefined;

}

var findSentiment = function(tweet){

	var sentiment = sntApi(tweet.text);
	if(sentiment.words.length>0){
		return sentiment;
	}
	return undefined;
}

module.exports.findTopic = findTopic;
module.exports.findCoordinates = findCoordinates;
module.exports.findSentiment = findSentiment;
