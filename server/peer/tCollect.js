
console.log('tcollect init. It collects twitter data on different topics.');
var twit = require('twit');
var config = require('./../conf');
var mongo = require('mongodb');
var ExtendedTweet = require('./../classes/ExtendedTweet');

var mongoClient = mongo.MongoClient;

var collectionName = config.peer.list_name;
var collectKeywords = config.peer.keywords;
var collectStream = collectKeywords[0];
for(var i=1; i<collectKeywords.length; i++){
    collectStream += ' OR '+collectKeywords[i];
}
collectStream += ' since:2015-01-01';
//var collectStream = "feminism OR feminist OR women's rights OR gender crime since:2015-01-01";//keywords arranged for stream query
console.log('Collect stream query : '+collectStream);

var uniqueData = {};

var mongoSaveInterval = null;
var stream = null;
var queryInterval = null;
var dbGlobal = null;

var useQueries = false;

var onTweetCallback = null;


//if you get twitter 401 errors check if the keys below are correct, time on your server is correct, if twitter has new api then upgrate twit
var startCollectingTweets = function (){
    console.log('tcollect: Starting tweet collection.');
    var tSearch = new twit({
        consumer_key:         config.twitter.consumer_key
      , consumer_secret:      config.twitter.consumer_secret
      , access_token:         config.twitter.access_token
      , access_token_secret:  config.twitter.access_token_secret
    });
    
    
    stream = tSearch.stream('statuses/filter', { track: collectKeywords });
    
    // Connect to the db //strat mango db before trying to connect.
    mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
      if(!err) {
        console.log("tcollect: We are connected to mongo db");
        dbGlobal = db;
        var collection = db.collection(collectionName);
        
        

        stream.on('tweet', function (newTweet) {
            //var textData = newTweet.text;
            //var id = newTweet.id_str;
            
            var now = new Date();

            var extTweet = new ExtendedTweet(collectionName, collectKeywords, now, 'streamed_tweet', newTweet);
            collection.insert(extTweet, {w:0}, function(err, result) {});
            //var jsonDate = now.toJSON();
            //var tClientData = new TDataObj(jsonDate,'streamed_tweet',newTweet);
            //console.log(JSON.stringify(extTweet,null,'\t'));
            if(onTweetCallback !=null){
                onTweetCallback(extTweet);
            }
                                
        });

        stream.on('limit', function (limitMessage) {
          console.log("twitter stream limit message ----start ----------------------------------------");
          console.log(JSON.stringify(limitMessage, null, 2));
          console.log("twitter stream limit message ----end ------------------------------------------");
        });


        
        /*
        var testPrint = function(){
            console.log('testprint',uniqueData);
            //collection.drop();
            //collection.find().toArray(function(err, items) {console.log(items);});
 
        };
        setInterval(testPrint, 5000);//clearing every 5 sec
        */
        
        
      }
      else{
          console.log("mongodb error connecting: "+err);
      }
    });
    
    //to decript json date object
    // var jsonDate = "2011-05-26T07:56:00.123Z";
    // var then = new Date(jsonDate);
    
    //var tQueryKeys = ""
    
    
    //var collectedTData = [];
    
    
    /*var collectThroughQueries = function (){//needs updating
        tSearch.get('search/tweets', 
                { q: collectStream, count: 100 }, //count 100 is max twitter allows
                function(err, tweetData, response) {
                    if(tweetData!=null && tweetData!='undefined' && tweetData.statuses!='undefined'){
                        for (var i = 0; i < tweetData.statuses.length; i++) {
                            var textData = tweetData.statuses[i].text;
                            var id = tweetData.statuses[i].id_str;
                            //use googleplaces api to get location.. nodejs places module installed
                            var now = new Date();
                            var jsonDate = now.toJSON();
                            var tClientData = new TDataObj(jsonDate,'bulk_tweet',tweetData.statuses[i]);
                            //do something with it
                            //collectedTData.push(tClientData);
                            uniqueData[id] = tClientData;
                        }
                    }
                }   
        );
    }*/
    
    //if(useQueries){
   //     queryInterval = setInterval(collectThroughQueries, 5000);//calling every 5 seconds as rate limit is 180 queries every 15 minutes
    //}
    
    
    
    

}

var stopCollectingTweets = function(){
    //clearInterval(mongoSaveInterval);
    //if(useQueries){
      //  clearInterval(queryInterval);
    //}
    stream.stop();
    dbGlobal.close();
}

var changeSearchParam = function(peer){
    stopCollectingTweets();
    collectionName = peer.collectionName;
    collectKeywords = peer.searchKeywords;
    startCollectingTweets();
}
    
module.exports.changeSearchParam = function(peer) {
    changeSearchParam(peer);
}

module.exports.startCollectingTweets = function() {
    startCollectingTweets();
}

module.exports.setOnTweetCallback = function(callback) {
    onTweetCallback = callback;
}