
var mongo = require('mongodb');
var config = require('../conf');

    var mongoClient = mongo.MongoClient;

    
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
    
    var startReadingStream = function (){



        // Connect to the db //strat mango db before trying to connect.
        mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
          if(!err) {
            console.log("tread: We are connected to mongo db");
            var collection = db.collection('feminism');//try feminismCoordinate for smaller set
            var timezoneCol = db.collection('timezone');
            var readyToDraw = db.collection('feminism_readyToDraw');
            readyToDraw.drop();
            var timezone = null;
            var dataCoordinateMappedSentiment = {};


            //start debugging section;
            var totalTweetCount = 1;
            collection.count(function(err, countRet) {
              totalTweetCount = countRet;
                console.log('total collections elements: '+totalTweetCount);
            });
            var currentStreamCount = 0;
            var printCompletionPercentage = function(){
              var percentage = (currentStreamCount/totalTweetCount*100);
              console.log('completed percentage % : '+ percentage);
              if(percentage >= 100){
                clearInterval(printCompletionPercentage);//clear interval does not seem to be working
              }
            }
            setInterval(printCompletionPercentage, 30000);//print percentage every 30 sec
            //end debugging section;

            var getTimeZone = function(tweet){
                var timezoneFound = null;
                for(var i=0; i<timezone.length; i++){
                    if(typeof(tweet.user.time_zone) != 'undefined' && tweet.user.time_zone!=null && tweet.user.time_zone == timezone[i].name){
                        timezoneFound = timezone[i];
                        break;
                    }
                }
                return timezoneFound;
            }

            var initStream = function(){
                var stream = collection.find().stream();

                var firststream = true;
                stream.on("data", function(item) {

                    for (key in item) {
                        
                        if (key!='_id' && item.hasOwnProperty(key)) {
                            var sentiment = item[key].sentiment;
                            var tweet = item[key].tweet;
                            if(tweet!=null && typeof(tweet)!='undefined' && sentiment.words.length>0){
                                if( tweet.coordinates!=null && typeof(tweet.coordinates) != 'undefined'){
                                    var lat = tweet.coordinates.coordinates[1];
                                    var lng = tweet.coordinates.coordinates[0];
                                    var latlng = lat+','+lng;
                                    
                                    if( typeof(dataCoordinateMappedSentiment[latlng])!='undefined'){
                                        var myData = dataCoordinateMappedSentiment[latlng];
                                        myData.tweetCount++;
                                        myData.averageSentiment = myData.averageSentiment + sentiment.score;
                                    }
                                    else{
                                        var myData = new MiniTData(sentiment, lat, lng);
                                        myData.averageSentiment = sentiment.score;
                                        dataCoordinateMappedSentiment[latlng] = myData;
                                    }
                                    
                                    //streamCallback(myData);
                                }
                                else{
                                    var timezoneFound = getTimeZone(tweet);
                                    if(timezoneFound!=null){
                                        var lat = timezoneFound.lat;
                                        var lng = timezoneFound.lng;
                                        var latlng = lat+','+lng;
                                        
                                        if( typeof(dataCoordinateMappedSentiment[latlng])!='undefined'){
                                            dataCoordinateMappedSentiment[latlng].tweetCount++;
                                        }
                                        else{
                                            var myData = new MiniTData(sentiment, lat, lng);
                                            dataCoordinateMappedSentiment[latlng] = myData;
                                        }
                                        //streamCallback(myData);
                                    }
                                }
                            }
                        }
                    }//end for loop 
                    
                    
                    
                    currentStreamCount++;//only for debugging
                    
                    
                });

                stream.on("end", function() {
                    console.log("saving data");
                    var size = 0;
                    for (key in dataCoordinateMappedSentiment) {
                        var data = dataCoordinateMappedSentiment[key];
                        data.averageSentiment = data.averageSentiment / data.tweetCount;
                        //console.log(JSON.stringify(data, null, 1));
                        //TODO save data here
                        readyToDraw.insert(data, { w: 1 }, function(err, result) { if(err)console.log("err: "+err);});
                        size++;
                    }
                    console.log("data saved: "+size);
                });
            }
            
            timezoneCol.find().toArray(function(err, items) {
                //console.log(items);
                timezone = items;
                initStream();
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
              console.log("mongodb error connecting: "+err);
          }
        });



    };
    
    startReadingStream();

