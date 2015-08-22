var mongo = require('mongodb');
var config = require('./../conf');
var ExtendedTweet = require('./../classes/ExtendedTweet');
var TimeSeries = require('./../classes/TimeSeries');
var tweetUtils = require('./../utils/tweetUtils');

var timeSeries = new TimeSeries();

var mongoClient = mongo.MongoClient;

var collectionName = config.peer.list_name;
var collectKeywords = config.peer.keywords;
var filterData = config.client.filterData[collectionName];

mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
	if(!err) {
		console.log("tcollect: We are connected to mongo db");
		var collection = db.collection(collectionName);
		var collectionTimeSeries = db.collection(collectionName+'_timeseries');
		collectionTimeSeries.drop();

		var stream = collection.find().stream();

		var totalTweetCount = 1;
        collection.count(function(err, countRet) {
          totalTweetCount = countRet;
            console.log('total collections elements: '+totalTweetCount);
        });

		var dataCount = 0;
		var currentStreamCount = 0;//for debugging only
		stream.on("data", function(item) {

			//if( typeof(item.tweet) != 'undefined' ){
				var id = item._id;
				var tweet = item.tweet;
				var extTweet = new ExtendedTweet(item.title, item.queryParam, new Date(item.date), item.type, tweet);

				var topic = tweetUtils.findTopic(tweet,filterData);
				var sentiment = tweetUtils.findSentiment(tweet);
				var coordinates = tweetUtils.findCoordinates(tweet);

				extTweet.setSentiment(sentiment);
				extTweet.setCoordinates(coordinates);
				extTweet.setTopic(topic);

				if(typeof(extTweet.sentiment)!='undefined' && typeof(extTweet.coordinates)!='undefined'){
					//console.log(coordinates.toString());
					timeSeries.addRawData(id,extTweet);
				}
				
				//console.log(dataCount);
        	//}
        	//else{
        	//	console.log('jzTest1 tweet not found: '+JSON.stringify(item)+"\n\r\n\r\n\r");
        	//}
        	dataCount++;
        	currentStreamCount++;
		});

		var readyToSave = false//for debugging only

		stream.on("end", function() {//check if all processing complete before storing.
			//console.log(JSON.stringify(timeSeries));
			readyToSave = true;
			var dataMap = timeSeries.dataMap;
			console.log('timeseriesDataReady to save');
			var dataCount = 0;
			for (dayDate in dataMap) {
				var dayDateMap = dataMap[dayDate];
				for(topic in dayDateMap){
					var geoSpatialTimeSeries = dayDateMap[topic];
					dataCount++;
				}

			}

			for (dayDate in dataMap) {
				var dayDateMap = dataMap[dayDate];
				for(topic in dayDateMap){
					var geoSpatialTimeSeries = dayDateMap[topic];
					collectionTimeSeries.insert(geoSpatialTimeSeries, {w:1}, 
							function(err,result){
								if(err){
									console.log('error saving'+err);
								}
								else{
									dataCount--;
									if(dataCount < 20){
										console.log('save count remaining: '+dataCount);
									}
								}
							}
					);
				}

			}
			//collectionTimeSeries.insert();
		});

		var printCompletionPercentage = function(){
          var percentage = (currentStreamCount/totalTweetCount*100);
          console.log('completed percentage % : '+ percentage);
          if(percentage >= 100 && readyToSave){
            clearInterval(printCompletionPercentageIntervalId);
          }
        }
        printCompletionPercentageIntervalId = setInterval(printCompletionPercentage, 10000);//print percentage every 10 sec

	}
});