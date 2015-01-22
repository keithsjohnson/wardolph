
var tData;
var geocoder;
function init() {
    
    var socket = io.connect();

    socket.on('connect', function () {
      console.log("connected to server");
    });
    
    socket.on('syncTData', function (receivedData) {
      tData = receivedData;
      console.log("collectedTData received: ",receivedData);
    });

		geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': 'LA'}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	    	console.log('geocoderaddress',results);
	    }
		});
}

init();
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
	var map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
	
	
	
	// Construct the circle for each value in citymap.
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
      map: map,
      center: citymap[city].center,
      radius: Math.sqrt(citymap[city].population) * 100
    };
    // Add the circle for this city to the map.
    cityCircle = new google.maps.Circle(populationOptions);
  }
}
google.maps.event.addDomListener(window, 'load', mapInit);