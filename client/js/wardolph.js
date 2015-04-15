
var tData;
var geocoder;
var googleMap;
function initSocket() {
    
    var socket = io.connect();

    socket.on('connect', function () {
      console.log("connected to server");
    });
    
    var dataReceivedCount = 0;
    socket.on('syncTData', function (receivedData) {
		tData = receivedData;
		var lng = receivedData.coordinates.lng;
		var lat = receivedData.coordinates.lat;
		var averageSentiment = receivedData.averageSentiment;
		/*var marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat,lng),
			map: googleMap,
			title:"count: "+receivedData.tweetCount
		});*/
		var circleDrawOptions = {
		  averageSentiment: averageSentiment,
	      strokeColor: '#AEBFC7',
	      strokeOpacity: 0.8,
	      strokeWeight: 1,
	      fillColor: '#AEBFC7',
	      fillOpacity: 0.35,
	      map: googleMap,
	      center: new google.maps.LatLng(lat,lng),
	      radius: Math.sqrt(receivedData.tweetCount) * 5000//TODO look into it.
	    };
	    // Add the circle to the map.
	    var tCircle = new google.maps.Circle(circleDrawOptions);

	    google.maps.event.addListener(tCircle,'mouseover',function(){
             this.getMap().getDiv().setAttribute('title', 'Sentiment: '+averageSentiment);});

        google.maps.event.addListener(tCircle,'mouseout',function(){
             this.getMap().getDiv().removeAttribute('title');});

		dataReceivedCount++;
      //console.log("averageSentiment: "+receivedData.averageSentiment);
      $('#data-received strong').text(dataReceivedCount);
    });

	/*	geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': 'LA'}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	    	console.log('geocoderaddress',results);
	    }
		});
*/

/*// Construct the circle for each value in citymap.
  // Note: We scale the area of the circle based on the population.
  var citymap = {};
citymap['chicago'] = {
  center: new google.maps.LatLng(41.878113, -87.629798),
  population: 2714856
};
citymap['newyork'] = {
  center: new google.maps.LatLng(40.714352, -74.005973),
  population: 8405837
};
citymap['losangeles'] = {
  center: new google.maps.LatLng(34.052234, -118.243684),
  population: 3857799
};
citymap['vancouver'] = {
  center: new google.maps.LatLng(49.25, -123.1),
  population: 603502
};
var cityCircle;
  for (var city in citymap) {
    var populationOptions = {
      strokeColor: '#AEBFC7',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: '#AEBFC7',
      fillOpacity: 0.35,
      map: googleMap,
      center: citymap[city].center,
      radius: Math.sqrt(citymap[city].population) * 100
    };
    // Add the circle for this city to the map.
    cityCircle = new google.maps.Circle(populationOptions);
  }*/

}


//$(document).ready(init);
	
//google map stuff

function mapInit() {

	var featureOpts = [
		{
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#193341"
				}
			]
		},
		{
			"featureType": "landscape",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#2c5a71"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#29768a"
				},
				{
					"lightness": -37
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#406d80"
				}
			]
		},
		{
			"featureType": "transit",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#406d80"
				}
			]
		},
		{
			"elementType": "labels.text.stroke",
			"stylers": [
				{
					"visibility": "on"
				},
				{
					"color": "#3e606f"
				},
				{
					"weight": 2
				},
				{
					"gamma": 0.84
				}
			]
		},
		{
			"elementType": "labels.text.fill",
			"stylers": [
				{
					"color": "#ffffff"
				}
			]
		},
		{
			"featureType": "administrative",
			"elementType": "geometry",
			"stylers": [
				{
					"weight": 0.6
				},
				{
					"color": "#1a3541"
				}
			]
		},
		{
			"elementType": "labels.icon",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#2c5a71"
				}
			]
		}
	];
	var mapOptions = {
		center: { lat: 54.5593, lng: -4.1748},
		zoom: 2,
		disableDefaultUI: true,
		panControl: true,
    zoomControl: true,
		styles: featureOpts
	};
	googleMap = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
	
	
	
	

  google.maps.event.addListenerOnce( googleMap, 'idle', initSocket );
}
google.maps.event.addDomListener(window, 'load', mapInit);


