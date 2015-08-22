

var TimeSeries = function(){

	this.dataMap = {};//contains [dayDate][topic]:GeoSpatialTimeSeries mapping

}

TimeSeries.prototype.addData = function(data){//used for reading mongo db data

	var year = data.year;
	var month = data.month;
	var day = data.day;
	var topic = data.topic;

	var dayDate = new Date(year,month,day);
	if(typeof(this.dataMap[dayDate])=='undefined' ){
		this.dataMap[dayDate] = {};
	}
	this.dataMap[dayDate][topic] = data;
	
}

TimeSeries.prototype.addRawData = function(dataId,extTweet){

	var date = new Date(extTweet.date);//converting ISO date to date object

	var year = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();//Returns the day of the month (from 1-31)
	var hour = date.getHours();//Returns the hour (from 0-23)
	//var minute = date.getMinutes();//Returns the minutes (from 0-59)

	var dayDate = new Date(year,month,day);
	var sentiment = extTweet.sentiment.score;
	var topic = extTweet.topic;
	//var coordinates = extTweet.coordinates.toString();
	var coordinateStrKey = extTweet.coordinates.toString();
	coordinateStrKey = coordinateStrKey.replace(/\./g,'_');//replace all occurences of dot
	console.log('jzTest4: '+extTweet.coordinates.toString());
	if(typeof(this.dataMap[dayDate])=='undefined' ){
		this.dataMap[dayDate] = {};
	}
	if(typeof(this.dataMap[dayDate][topic])=='undefined'){
		this.dataMap[dayDate][topic] = new TimeSeries.GeoSpatialTimeSeries(topic,sentiment,coordinateStrKey,dataId,year,month,day,hour);
	}
	else{
		this.dataMap[dayDate][topic].addData(sentiment,coordinateStrKey,dataId,hour);
	}

	

}

TimeSeries.GeoSpatialTimeSeries = function(topic,sentiment,coordinates,dataId,year,month,day,hour){
	this.year = year;
	this.month = month;//month of the year
	this.day = day;//day of the month
	this.topic = topic;
	//this.coordinates = coordinates;
	//this.dataDay;
	this.geoData = {};//contains coordinate:DataDay mapping
	this.addData(sentiment,coordinates,dataId,hour);
}

TimeSeries.GeoSpatialTimeSeries.prototype.addData = function(sentiment,coordinates,dataId,hour){

	if(typeof(this.geoData[coordinates])=='undefined'){
		this.geoData[coordinates] = new TimeSeries.DataDay(sentiment,dataId,hour);
	}
	else{
		this.geoData[coordinates].addData(sentiment,dataId,hour);
	}

}

TimeSeries.DataDay = function(sentiment,dataId,hour){
	
	this.count = 0;//count of the number of tweet objects
	this.sentimentSum = 0;//sum of all the sentiment values
	this.hours = {};//contains hourNumber:DataHour mapping
	this.addData(sentiment,dataId,hour);
}

TimeSeries.DataDay.prototype.addData = function(sentiment,dataId,hour){

	this.count++;
	this.sentimentSum += sentiment;

	if(typeof(this.hours[hour]) == 'undefined'){
		this.hours[hour] = new TimeSeries.DataHour(sentiment,dataId);
	}
	else{
		this.hours[hour].addData(sentiment,dataId);
	}
}

TimeSeries.DataHour = function(sentiment,dataId){
	this.count = 0;//count of the number of tweet objects
	this.sentimentSum = 0;//sum of all the sentiment values
	this.dataIds = [];//contains ids of the extended tweet objects.
	this.addData(sentiment,dataId);
}

TimeSeries.DataHour.prototype.addData = function(sentiment,dataId){
	this.count++;
	this.sentimentSum += sentiment;
	this.dataIds.push(dataId);
}





module.exports = TimeSeries;