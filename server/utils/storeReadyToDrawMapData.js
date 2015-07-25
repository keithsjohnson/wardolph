
var mongo = require('mongodb');
var config = require('../conf');
var sntApi = require('sentiment');
var TDataObj = require('./../classes/TDataObj');
var Coordinates = require('./../classes/Coordinates');
var MiniTData = require('./../classes/MiniTData');

    var mongoClient = mongo.MongoClient;

    
    var tweetsWithCoordinates = {};
    
    var getCoordinateViaTimeZone = false;
    
    
    
    var startReadingStream = function (){



        // Connect to the db //strat mango db before trying to connect.
        mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
          if(!err) {
            console.log("tread: We are connected to mongo db");
            var collection = db.collection(config.peer.list_name);//try feminismCoordinate for smaller set
            var timezoneCol = db.collection('timezone');
            var readyToDraw = db.collection(config.peer.list_name+'_readyToDraw');
            readyToDraw.drop();
            var timezone = null;
            var keywordDataMap = {};
            var dataCoordinateMappedSentiment = {};


            //start debugging section;
            var totalTweetCount = 1;
            collection.count(function(err, countRet) {
              totalTweetCount = countRet;
                console.log('total collections elements: '+totalTweetCount);
            });
            var currentStreamCount = 0;
            var printCompletionPercentageIntervalId = 0;
            var readyToSave = false;
            var printCompletionPercentage = function(){
              var percentage = (currentStreamCount/totalTweetCount*100);
              console.log('completed percentage % : '+ percentage);
              if(percentage >= 100 && readyToSave){
                clearInterval(printCompletionPercentageIntervalId);

                console.log("saving data");
                var size = 0;
                for(topic in keywordDataMap){
                    for(latlng in keywordDataMap[topic]){
                        var data = keywordDataMap[topic][latlng];
                        data.averageSentiment = data.averageSentiment / data.tweetCount;
                        readyToDraw.insert(data, { w: 1 }, function(err, result) { if(err)console.log("err: "+err);});
                        size++;
                    }
                }
                /*for (key in dataCoordinateMappedSentiment) {
                    var data = dataCoordinateMappedSentiment[key];
                    data.averageSentiment = data.averageSentiment / data.tweetCount;
                    //console.log(JSON.stringify(data, null, 1));
                    //TODO save data here
                    readyToDraw.insert(data, { w: 1 }, function(err, result) { if(err)console.log("err: "+err);});
                    size++;
                }*/
                console.log("data saved: "+size);
              }
            }
            printCompletionPercentageIntervalId = setInterval(printCompletionPercentage, 30000);//print percentage every 30 sec
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

            var storeInLatLongMap = function(lat, lng, sentiment, topic){
                
                var latlng = lat+','+lng;
                if(typeof(keywordDataMap[topic]) == 'undefined'){
                    keywordDataMap[topic] = {};
                }
                if(typeof(keywordDataMap[topic][latlng]) == 'undefined'){
                    var miniData = new MiniTData(lat, lng, topic);
                    keywordDataMap[topic][latlng] = miniData;
                }
                var miniData = keywordDataMap[topic][latlng];
                miniData.tweetCount++;
                miniData.averageSentiment = miniData.averageSentiment + sentiment.score;
                //console.log('storing: '+topic+' '+lat+' '+lng);

                if(topic != 'all'){
                    storeInLatLongMap(lat, lng, sentiment, 'all');
                }
            }

            var filterData = config.client.filterData[config.peer.list_name];
            console.log('classifying data on: '+JSON.stringify(filterData, null, 1));
            var findTopic = function(tweet){
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

            var initStream = function(){
                var stream = collection.find().stream();

                var firststream = true;
                stream.on("data", function(item) {

                    //for (key in item) {
                        
                      //  if (key!='_id' && item.hasOwnProperty(key)) {
                            //var sentiment = item[key].sentiment;
                            //var item2 = item;//item[key];
                        if(typeof(item.tweet)!='undefined' && typeof(item.tweet.text)!='undefined'){
                            var tweet = item.tweet;
                            var sentiment = sntApi(item.tweet.text);
                            var topic = findTopic(item.tweet);
                            if(tweet!=null && typeof(tweet)!='undefined' && sentiment.words.length>0){
                                if( tweet.coordinates!=null && typeof(tweet.coordinates) != 'undefined'){
                                    var lat = tweet.coordinates.coordinates[1];
                                    var lng = tweet.coordinates.coordinates[0];
                                    
                                    storeInLatLongMap(lat,lng,sentiment,topic);
                                    //console.log('jzTest1 sentiment: '+sentiment.score+' tweet:  '+tweet.text);
                                }
                                else{
                                    var timezoneFound = getTimeZone(tweet);
                                    if(timezoneFound!=null){
                                        var lat = timezoneFound.lat;
                                        var lng = timezoneFound.lng;
                                        
                                        storeInLatLongMap(lat,lng,sentiment,topic);
                                        //console.log('jzTest1 sentiment: '+sentiment.score+' tweet:  '+tweet.text);
                                    }
                                }
                            }
                        }
                        //}
                    //}//end for loop 
                    
                    
                    
                    currentStreamCount++;//only for debugging
                    
                    
                });

                stream.on("end", function() {//check if all processing complete before storing.
                    readyToSave = true;
                    
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

