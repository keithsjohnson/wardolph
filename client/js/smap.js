//sentiment map

var SMap = function(mapInitCallback){

	this.mapInitCallback = mapInitCallback;
	this.map = null;
	this.drawnDataPoints = [];

	this.highSntColour = [151, 83, 34];   // color of max negative sentiment
	this.lowSntColour = [5, 69, 54];  // color of max positive sentiment
	this.minSnt = 0;
	this.maxSnt = 2;
}

SMap.prototype.drawMap = function(){

	var featureOpts = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}];
		var mapOptions = {
			center: { lat: 54.5593, lng: -4.1748},
			zoom: 2,
			disableDefaultUI: true,
			panControl: true,
	    zoomControl: true,
			styles: featureOpts
		};
		this.map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
		
		
		
		

	  google.maps.event.addListenerOnce( this.map, 'idle', this.mapInitCallback );
}

SMap.prototype.drawData = function(filteredData){
	
	for (key in filteredData) {
		var tMiniData = filteredData[key];
		this.drawDataPoint(tMiniData);
	}
}

SMap.prototype.drawDataPoint = function(tMiniData){

	var map = this.map;
	var lng = tMiniData.coordinates.lng;
	var lat = tMiniData.coordinates.lat;
	var averageSentiment = tMiniData.averageSentiment;//round it up to 2 decimal Math.round(num * 100) / 100

	var color = this.interpolateHsl(averageSentiment);

	var circleDrawOptions = {
		strokeColor: '#AEBFC7',
		strokeOpacity: 0.8,
		strokeWeight: 1,
		fillColor: color,
		fillOpacity: 0.4,
		map: map,
		center: new google.maps.LatLng(lat,lng),
		radius: tMiniData.radius,
		zIndex: -tMiniData.tweetCount
	};
	// Add the circle to the map.
	var tCircle = new google.maps.Circle(circleDrawOptions);
	this.drawnDataPoints.push(tCircle);
	google.maps.event.addListener(tCircle,'mouseover',function(){
		map.getDiv().setAttribute('title', 'Count:'+tMiniData.tweetCount+' Sentiment:'+averageSentiment+' Topic:'+tMiniData.topic);});

	google.maps.event.addListener(tCircle,'mouseout',function(){
		map.getDiv().removeAttribute('title');
	});
}

SMap.prototype.clearDrawnData = function(){
	for (var i = 0; i < this.drawnDataPoints.length; i++) {
		var dataPoint = this.drawnDataPoints[i];
		if(dataPoint.clearMap){
			dataPoint.clearMap();
		}
		else{
			dataPoint.setMap(null);
		}
	}
	this.drawnDataPoints = [];
}

SMap.prototype.interpolateHsl = function(averageSentiment) {
	var sntPositive = averageSentiment+this.maxSnt/2;//supporting sentiment range -2.5 to +2.5
	if(sntPositive<this.minSnt)
		sntPositive = this.minSnt;
	if(sntPositive>this.maxSnt)
		sntPositive = this.maxSnt;
	var fraction = sntPositive / this.maxSnt;


	var highHsl = this.highSntColour;
	var lowHsl = this.lowSntColour;
	var color = [];
	for (var i = 0; i < 3; i++) {
	// Calculate color based on the fraction.
	color[i] = (highHsl[i] - lowHsl[i]) * fraction + lowHsl[i];
	}

	return 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)';
}

SMap.prototype.drawRealTimeData = function(data){
	var sntVal = data.sentiment.score;
	var color = this.interpolateHsl(sntVal);
	var dataPoint = new SMap.DataPoint(data.coordinates.lat, data.coordinates.lng, data.title, color, 0, this.map);
	this.drawnDataPoints.push(dataPoint);
}

SMap.DataPoint = function(lat, lng, title, color, zIndex, map) {
	this.bounds_ = new google.maps.LatLng(lat, lng);
	this.lat_ = lat;
	this.lng_ = lng;
	this.title_ = title;
	this.color = color;
	this.zIndex_ = zIndex;
	this.div_ = null;
	this.setMap(map);
}

SMap.DataPoint.prototype = new google.maps.OverlayView();

SMap.DataPoint.prototype.clearMap = function(){
	this.setMap(null);
}

SMap.DataPoint.prototype.onAdd = function() {
	var this_ = this;
	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.title = this.title_;
	div.style.zIndex = this.zIndex_;
	div.style.boxShadow = 'inset 0 0 5px #fff, inset 2px 0 8px '+this.color+', 0 0 1px 1px #fff, 0 0 2px 4px '+this.color;
	div.className  = 'green-glow';
	
	this.div_ = div;

	google.maps.event.addDomListener(this_.div_, "click", function (e) {
	      
	          google.maps.event.trigger(this_, "click", e);
	          cAbortEvent(e); // Prevent click from being passed on to map
	});
	google.maps.event.addDomListener(this.div_, "dblclick", function (e) {
	        google.maps.event.trigger(this_, "dblclick", e);
	        cAbortEvent(e); // Prevent map zoom when double-clicking on a label
	});
	    
	// Add the element to the "overlayImage" pane.
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this.div_);
};

SMap.DataPoint.prototype.getPosition = function (){
	return this.bounds_;
};

SMap.DataPoint.prototype.draw = function() {

	// We use the south-west and north-east
	// coordinates of the overlay to peg it to the correct position and size.
	// To do this, we need to retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	var pixelPosition = overlayProjection.fromLatLngToDivPixel(this.bounds_);

	var div = this.div_;
	div.style.left = pixelPosition.x + 'px';
	div.style.top = pixelPosition.y + 'px';
};

SMap.DataPoint.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};