(function() {
    console.log('tread started. Read ReadyToDraw Data.');
    var twit = require('twit');
    var config = require('./conf');
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
        var minRadius = 100;
        var maxRadius = 1000000;
        var minTweetCount = 0;//not really true but helps draw tweet when there is just one.

        returnValue = minRadius + (tweetCount-minTweetCount)/(maxTweetCount - minTweetCount) * (maxRadius - minRadius)
        return returnValue;
    }
    
    var dataCoordinateMappedSentiment = {};

    var initData = function (){



        // Connect to the db //strat mango db before trying to connect.
        mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
          if(!err) {
            console.log("tread: We are connected to mongo db");
            var readyToDrawCollection = db.collection(config.peer.list_name+'_readyToDraw');
            var timezoneCol = db.collection('timezone');
            var timezone = null;
            var maxTweetCount = 0;

            var startStreaming = function(){
                var stream = readyToDrawCollection.find().stream();

                var firststream = true;
                stream.on("data", function(item) {

                    if(item.tweetCount > 10){//if(item.tweetCount > 20){
                            
                            var latlng = item.coordinates.lat+','+item.coordinates.lng;
                            //console.log(interpolateArea(item.tweetCount, maxTweetCount));
                            item.radius = Math.sqrt(interpolateArea(item.tweetCount, maxTweetCount))*1000;//converting area into radius.. sort of..
                            //item.radius = Math.sqrt(item.tweetCount) * 3000;//max radius should be 950,000
                            dataCoordinateMappedSentiment[item.topic+latlng] = item;
                            //dataCoordinateMappedSentiment[latlng+'0'] = item;
                            //dataCoordinateMappedSentiment[latlng+'00'] = item;
                            //dataCoordinateMappedSentiment[latlng+'000'] = item;
                    }
                    
                    
                    //currentStreamCount++;//only for debugging
                    
                    
                });

                stream.on("end", function() {
                    console.log('tread data initialized');
                });
            }
            
            readyToDrawCollection.aggregate(
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

            //start debugging section;
        /*    var totalTweetCount = 1;
            collection.count(function(err, countRet) {
              totalTweetCount = countRet;
                console.log('total collections elements: '+totalTweetCount);
            });
            var currentStreamCount = 0;
            var printCompletionPercentage = function(){
              var percentage = (currentStreamCount/totalTweetCount*100);
              console.log('completed percentage % : '+ percentage);
              if(percentage >= 100){
                clearInterval(printCompletionPercentage);
              }
            }
            setInterval(printCompletionPercentage, 30000);//print percentage every 30 sec
            //end debugging section;
*/
            


                
            

            

            

            /*collection.find().toArray(function(err, items) {
                //console.log(items);
                tweetsWithCoordinates = items;
            });*/
            
            //to decript json date object
            // var jsonDate = "2011-05-26T07:56:00.123Z";
            // var then = new Date(jsonDate);
            
          }
          else{
              console.log("tread: mongodb error connecting: "+err);
          }
        });

    }

    
    
    //initData();

    var startReadingStream = function(){
        console.log("sending data");
        var size = 0;
        for (key in dataCoordinateMappedSentiment) {
            var data = dataCoordinateMappedSentiment[key];
            streamCallback(data);
            size++;
        }
        console.log("data sent: "+size);
    }

    module.exports.initData = function() {
        return initData();
    }
    
    module.exports.getTData = function() {
        return dataCoordinateMappedSentiment;
    }

    module.exports.setStreamCallback = function(callback) {
        streamCallback = callback;
    }

    module.exports.startReadingStream = function() {
        startReadingStream();
    }
    

}());