(function() {
    console.info('tcollect started');
    var twit = require('twit');
    var sentiment = require('sentiment');
    var config = require('./conf');
    console.log("jzTest config key: "+config.twitter.consumer_key);
    var tSearch = new twit({
        consumer_key:         config.twitter.consumer_key
      , consumer_secret:      config.twitter.consumer_secret
      , access_token:         config.twitter.access_token
      , access_token_secret:  config.twitter.access_token_secret
    });
    
    

    
    
    var stream = tSearch.stream('statuses/filter', { track: '#firstworldproblems' });
    
    //var collectedTData = [];
    var uniqueData = {};
    
    var collectThroughQueries = function (){
        tSearch.get('search/tweets', 
                { q: '#firstworldproblems since:2014-11-11', count: 100 }, 
                function(err, tweetData, response) {
                    if(tweetData!=null && tweetData!='undefined' && tweetData.statuses!='undefined'){
                        for (var i = 0; i < tweetData.statuses.length; i++) {
                            var textData = tweetData.statuses[i].text;
                            var snt = sentiment(textData);
                            //use googleplaces api to get location.. nodejs places module installed
                            var tClientData = {name:'bulk_tweet', text:textData, sentiment:snt, tweet:tweetData.statuses[i]};
                            //do something with it
                            //collectedTData.push(tClientData);
                            uniqueData[textData] = tClientData;
                        }
                    }
                }   
        );
    }
    
    setInterval(collectThroughQueries, 5000);//calling every 5 seconds as rate limit is 180 queries every 15 minutes
    
    
    var clearData = function (){
        uniqueData = {};
    }
    setInterval(clearData, 300000);//clearing every 5 min
    /*for (var i = 0; i < tweetData.statuses.length; i++) {
      
      var tClientData = {name:'bulk_tweet', text:tweetData.statuses[i].text, tweet:tweetData.statuses[i]};
      //do something with it
      collectedTData.push(tClientData);
    };*/
    
    stream.on('tweet', function (newTweet) {
        var textData = newTweet.text;
        var snt = sentiment(textData);
        var tClientData = {name:'streamed_tweet', text:textData, sentiment:snt, tweet:newTweet};
        //do something with it
        //collectedTData.push(tClientData);
        uniqueData[textData] = tClientData;
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