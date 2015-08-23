var mongo = require('mongodb');
var config = require('./../conf');
var ExtendedTweet = require('./../classes/ExtendedTweet');
var MiniTData = require('./../classes/MiniTData');
var TimeSeries = require('./../classes/TimeSeries');


var timeSeries = new TimeSeries();

var mongoClient = mongo.MongoClient;

var collectionName = config.peer.list_name;
var collectKeywords = config.peer.keywords;
var filterData = config.client.filterData[collectionName];

var interpolateArea = function(tweetCount, maxTweetCount){//will interpolate circle area
	var minRadius = 2000;
	var maxRadius = 1000000;
	var minTweetCount = 1;//not really true but helps draw tweet when there is just one.

	returnValue = minRadius + (tweetCount-minTweetCount)/(maxTweetCount - minTweetCount) * (maxRadius - minRadius)
	return returnValue;
}

var getData = function(month) {
	var dataMap = timeSeries.dataMap;
	//console.log('jzTest2: '+JSON.stringify(dataMap['all']));

	var returnData = {};
	for(key in dataMap){
		var date = new Date(key);
		if(date.getMonth()==month){
			var topicData = dataMap[key];
			for(topic in topicData){
				var timeseriesData = topicData[topic];
				if(typeof(returnData[topic])=='undefined'){
					returnData[topic] = {};
				}
				if(typeof(returnData['all'])=='undefined' && topic!='all'){
					returnData['all'] = {};
				}
				//console.log('jzTest3: '+JSON.stringify(timeseriesData));
				for(coordinateStr in timeseriesData.geoData){
					var dataDay = timeseriesData.geoData[coordinateStr];
					var latlng = coordinateStr.replace(/_/g,'.');//replace instances of '_'
					var latlngArr = latlng.split(',');
					var lat = latlngArr[0];
					var lng = latlngArr[1];
					//console.log('jzTest5: '+JSON.stringify(latlngArr));
					if(typeof(returnData[topic][latlng])=='undefined'){
						returnData[topic][latlng] = new MiniTData(lat,lng,topic);
					}
					if(typeof(returnData['all'][latlng])=='undefined' && topic!='all'){
						returnData['all'][latlng] = new MiniTData(lat,lng,'all');
					}
					returnData[topic][latlng].averageSentiment += dataDay.sentimentSum;
					returnData[topic][latlng].tweetCount += dataDay.count;
					if(topic!='all'){
						returnData['all'][latlng].averageSentiment += dataDay.sentimentSum;
						returnData['all'][latlng].tweetCount += dataDay.count;
					}
					
				}
				
			}
		}
	}

	var maxTweetCount = 40000;
	for(topic in returnData){
		var topicData = returnData[topic];
		//console.log('jzTest topic: '+topic);
		for(coordinate in returnData[topic]){
			var coordinateData = returnData[topic][coordinate];
			returnData[topic][coordinate].averageSentiment = coordinateData.averageSentiment/coordinateData.tweetCount;
			returnData[topic][coordinate].radius = Math.sqrt(interpolateArea(coordinateData.tweetCount, maxTweetCount))*1000;
		}
	}

	//console.log('sending data: '+month+' : '+returnData);
	return returnData;
}

mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
	if(!err) {
		var collection = db.collection(collectionName+'_timeseries');
		collection.find().toArray(
			function(err, items) {
				console.log('reading time series');
				for(var i=0; i<items.length; i++){
					var item = items[i];
					timeSeries.addData(item);
					//console.log('read time series data. size: '+JSON.stringify(item));
				}
				//console.log('read time series data. size: '+items.length);
				//var returnData = getData(5);
				//console.log('received data for month 8: '+JSON.stringify(returnData['all']));
			}
		);

		


	}
});

module.exports.getData = getData;