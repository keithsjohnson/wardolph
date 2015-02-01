var mongo = require('mongodb');
var config = require('./conf');

var mongoClient = mongo.MongoClient;
    


// Connect to the db //strat mango db before trying to connect.
mongoClient.connect("mongodb://"+config.ip+":27017/feminism", function(err, db) {
      if(!err) {
        console.log("mongodb: We are connected");
        var collection = db.collection('tcollect');
        
        //collection.drop();
        
        
        
        var testPrint = function(){
            console.log('testprint');
            //collection.drop();
            collection.find().toArray(function(err, items) {console.log(items);});
 
        };
        
        testPrint();
        //setInterval(testPrint, 5000);//clearing every 5 min
        
        
        
      }
      else{
          console.log("mongodb error connecting: "+err);
      }
});