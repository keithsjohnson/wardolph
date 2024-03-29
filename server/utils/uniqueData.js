var mongo = require('mongodb');
var config = require('../conf');
// var util = require('util');

var mongoClient = mongo.MongoClient;
    
var TDataObj = function (date,type,sentiment,tweet){
                        this.date = date;
                        this.type = type;
                        this.sentiment = sentiment;
                        this.tweet = tweet;
                    };

// Connect to the db //strat mango db before trying to connect.
mongoClient.connect("mongodb://"+config.ip+":27017/wardolph", function(err, db) {
      if(!err) {
        console.log("mongodb: We are connected");
        var collection = db.collection('feminism');
        
        //collection.drop();
        
        
        
        // var testPrint = function(){
        //     //console.log('testprint');
        //     //collection.drop();
        //     //collection.find().toArray(function(err, items) {console.log(items);});
 
        // };
        var duplicateTest = {};
        var totalDuplicates = 0;
        var tweetCount = 0;
        // testPrint();
        var count = 1;
        collection.count(function(err, countRet) {
          count = countRet;
            console.log('total collections elements: '+count);
          })

        
        var stream = collection.find().stream();
        var first = true;
        var currentStreamCount = 0;
        stream.on("data", function(item) {
          
            currentStreamCount++;

            for (key in item) {
                if(key=='_id')
                  continue;
                if (item.hasOwnProperty(key)) {
                  if(duplicateTest[key]){
                      duplicateTest[key]++;
                      totalDuplicates++;
                  }
                  else{
                    duplicateTest[key] = 1;
                  }
                    
                  tweetCount++;
                  
                }
            }//end for loop 
            // console.log(JSON.stringify(item, null, 2));
            //console.log(JSON.stringify(duplicateTest, null, 2));
          
          
         });

        var finishedExecution = false;
        stream.on("end", function() {
          
          finishedExecution = true;
        });
        //setInterval(testPrint, 5000);//clearing every 5 min
        
        var printCompletionPercentage = function(){
          var percentage = (currentStreamCount/count*100);
          console.log('completed percentage % : '+ percentage);
          if(finishedExecution && percentage >= 100){
            clearInterval(printCompletionPercentage);
            printMyTestData();
          }
        }

        setInterval(printCompletionPercentage, 60000);//print percentage every minute
        
        var printMyTestData = function(){
          console.log('------$$$-----');
          console.log('total tweet count: '+tweetCount);
          console.log('total duplicates found'+totalDuplicates);
          console.log('------$$$-----');
          console.log(JSON.stringify(duplicateTest, null, 2));
          console.log('------$$$-----');
        }

      }
      else{
          console.log("mongodb error connecting: "+err);
      }
});