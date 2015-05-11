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
    
    var dataCoordinateMappedSentiment = {};

    var initData = function (){



        // Connect to the db //strat mango db before trying to connect.
        mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
          if(!err) {
            console.log("tread: We are connected to mongo db");
            var readyToDrawCollection = db.collection('feminism_readyToDraw');
            var timezoneCol = db.collection('timezone');
            var timezone = null;
            


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
            

            
                var stream = readyToDrawCollection.find().stream();

                var firststream = true;
                stream.on("data", function(item) {

                    if(item.tweetCount > 20){
                            
                            var latlng = item.coordinates.lat+','+item.coordinates.lng;
                            item.radius = Math.sqrt(item.tweetCount) * 3000;//TODO look into it. base it on max tweet count
                            dataCoordinateMappedSentiment[latlng] = item;
                            //dataCoordinateMappedSentiment[latlng+'0'] = item;
                            //dataCoordinateMappedSentiment[latlng+'00'] = item;
                            //dataCoordinateMappedSentiment[latlng+'000'] = item;
                    }
                    
                    
                    //currentStreamCount++;//only for debugging
                    
                    
                });

                stream.on("end", function() {
                    console.log('tread data initialized');
                });
            

            

            

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