(function() {
    console.log('tcollect started');
    var twit = require('twit');
    var sentiment = require('sentiment');
    var config = require('./conf');
    var mongo = require('mongodb');

    var mongoClient = mongo.MongoClient;
    
    var uniqueData = {};
    
    //console.log("jzTest config key: "+config.twitter.consumer_key);
    var tSearch = new twit({
        consumer_key:         config.twitter.consumer_key
      , consumer_secret:      config.twitter.consumer_secret
      , access_token:         config.twitter.access_token
      , access_token_secret:  config.twitter.access_token_secret
    });
    
    
    // Connect to the db //strat mango db before trying to connect.
    mongoClient.connect("mongodb://"+config.ip+":27017/feminism", function(err, db) {
      if(!err) {
        console.log("mongodb: We are connected");
        var collection = db.collection('tcollect');
        
        //collection.drop();
        var saveClearData = function (){
            var now = new Date();
            var jsonDate = now.toJSON();
            var storeData = {jsonDate: jsonDate, uniqueData: uniqueData};
            collection.insert(storeData, {w:1}, function(err, result) {
                if(err)
                    console.log("data saved err: "+err);
            
                
            });
            
            
                 //   for (var m in uniqueData) {
                 //       console.log(m);
                 //   }
            
            //console.log("saving Data ");
            uniqueData = {};
            
            //saving data
            
            
        }
        
        
        setInterval(saveClearData, 60000);//saving every min
        
        
        //var testPrint = function(){
          //  console.log('testprint');
            //collection.drop();
            //collection.find().toArray(function(err, items) {console.log(items);});
 
        //};
        // setInterval(testPrint, 5000);//clearing every 5 min
        
        
        
      }
      else{
          console.log("mongodb error connecting: "+err);
      }
    });
    
    //to decript json date object
    // var jsonDate = "2011-05-26T07:56:00.123Z";
    // var then = new Date(jsonDate);
    
    //var tQueryKeys = ""
    var stream = tSearch.stream('statuses/filter', { track: ["feminism", "feminist", "women's rights", "gender crime"] });
    
    //var collectedTData = [];
    
    
    var collectThroughQueries = function (){
        tSearch.get('search/tweets', 
                { q: "feminism OR feminist OR women's rights OR gender crime since:2015-01-01", count: 100 }, 
                function(err, tweetData, response) {
                    if(tweetData!=null && tweetData!='undefined' && tweetData.statuses!='undefined'){
                        for (var i = 0; i < tweetData.statuses.length; i++) {
                            var textData = tweetData.statuses[i].text;
                            var id = tweetData.statuses[i].id_str;
                            var snt = sentiment(textData);
                            //use googleplaces api to get location.. nodejs places module installed
                            var tClientData = {name:'bulk_tweet', text:textData, sentiment:snt, tweet:tweetData.statuses[i]};
                            //do something with it
                            //collectedTData.push(tClientData);
                            uniqueData[id] = tClientData;
                        }
                    }
                }   
        );
    }
    
    setInterval(collectThroughQueries, 5000);//calling every 5 seconds as rate limit is 180 queries every 15 minutes
    
    
    
    stream.on('tweet', function (newTweet) {
        var textData = newTweet.text;
        var id = newTweet.id_str;
        var snt = sentiment(textData);
        var tClientData = {name:'streamed_tweet', text:textData, sentiment:snt, tweet:newTweet};
        //do something with it
        //collectedTData.push(tClientData);
        uniqueData[id] = tClientData;
    })
    
    var someThings = function() {
        console.log('---$$$***jzTestsomething function called -- $$----');
    };

    

    module.exports.getSomeThings = function() {
        return someThings();
    }
    
    module.exports.getTData = function() {
        return uniqueData;
    }
    

}());