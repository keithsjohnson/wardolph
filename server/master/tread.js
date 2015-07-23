(function() {
    console.log('tread started. Read ReadyToDraw Data.');
    var twit = require('twit');
    var config = require('./../conf');
    var mongo = require('mongodb');

    var mongoClient = mongo.MongoClient;

    var streamCallback = function(item) {};
    
    var tweetsWithCoordinates = {};
    
    var getCoordinateViaTimeZone = false;
    
    var TDataObj = function (date,type,sentiment,tweet){
                        this.date = date;
                        this.type = type;
                        this.sentiment = sentiment;
                        this.tweet = tweet;
                    };

    var Coordinates = function (lat,lng){
        this.lat = lat
        this.lng = lng;
    }
    
    var MiniTData = function (sentiment, lat, lng){
        this.sentiment = sentiment;
        this.coordinates = new Coordinates(lat,lng);
        this.tweetCount = 1;
        this.averageSentiment = 0;
    }

    var interpolateArea = function(tweetCount, maxTweetCount){//will interpolate circle area
        var minRadius = 2000;
        var maxRadius = 1000000;
        var minTweetCount = 1;//not really true but helps draw tweet when there is just one.

        returnValue = minRadius + (tweetCount-minTweetCount)/(maxTweetCount - minTweetCount) * (maxRadius - minRadius)
        return returnValue;
    }
    
    var mapData = {};

    var initData = function (){


        var initCollection = function(collection, collectionName){
            mapData[collectionName] = {};
            
            var maxTweetCount = 0;
            var startStreaming = function(){
                var stream = collection.find().stream();

                var firststream = true;
                stream.on("data", function(item) {

                    if(item.tweetCount > 0){//if(item.tweetCount > 20){
                            
                            var latlng = item.coordinates.lat+','+item.coordinates.lng;
                            //console.log(interpolateArea(item.tweetCount, maxTweetCount));
                            item.radius = Math.sqrt(interpolateArea(item.tweetCount, maxTweetCount))*1000;//converting area into radius.. sort of..
                            //item.radius = Math.sqrt(item.tweetCount) * 3000;//max radius should be 950,000
                            if(typeof(mapData[collectionName][item.topic]) == 'undefined'){
                                mapData[collectionName][item.topic] = {};
                            }
                            mapData[collectionName][item.topic][latlng] = item;
                    }                    
                    
                });
                
                var cleanData = function(){
                    console.log('cleaning data');
                    var dataToClean = mapData[collectionName];
                    var valuesToKeep = 200;//number of latlng values to keep for each topic
                    for(topic in dataToClean){
                        var topicData = dataToClean[topic];
                        //sorting all latlng based on tweet count
                        var keysSorted = Object.keys(topicData).sort(function(a,b){return topicData[b].tweetCount-topicData[a].tweetCount});
                        console.log('topic: '+topic+' value count: '+keysSorted.length);
                        //keeping top few latlng
                        if(keysSorted.length > valuesToKeep){ 
                            for (var i = valuesToKeep; i < keysSorted.length; i++) {
                                var key = keysSorted[i];
                                delete topicData[key];
                            };
                        }
                        
                    }

                }

                stream.on("end", function() {
                    setTimeout(cleanData, 1000);
                });
            }
            
            collection.aggregate(
                [
                 {
                   $group:
                     {
                        _id:null,
                        maxCount: { $max: "$tweetCount" }
                     }
                 }
               ], 
               function(err, result) {
                  //console.dir(result);
                  //console.log('aggregate result: '+result[0].maxCount);
                  maxTweetCount = result[0].maxCount;
                  startStreaming();
              });
        }

        //use format mapData[listName][topic][latlng]
        // Connect to the db //strat mango db before trying to connect.
        mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
          if(!err) {
            console.log("tread: We are connected to mongo db");

            for(key in config.client.filterData){
                var readyToDrawCollection = db.collection(key+'_readyToDraw');
                initCollection(readyToDrawCollection,key);
            }

            //var readyToDrawCollection = db.collection(config.peer.list_name+'_readyToDraw');
            //initCollection(readyToDrawCollection,config.peer.list_name);
            
            
          }
          else{
              console.log("tread: mongodb error connecting: "+err);
          }
        });

    }

    
    
    

    module.exports.initData = function() {
        return initData();
    }
    
    module.exports.getTData = function(pageTitle) {
        return mapData[pageTitle];
    }


    

}());