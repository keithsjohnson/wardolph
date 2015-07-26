

angular.module( 'wardolphMain.sentimentAnalysis', [
  'ui.router',
  'angulartics',
  'angulartics.google.analytics'
])
.config(function($stateProvider) {
  $stateProvider.state('sentimentAnalysis', {
    url: '/sentimentAnalysis/:pageTitle',
    controller: 'SentimentAnalysisCtrl',
    templateUrl: '/partial/sentimentAnalysis/sentimentAnalysis.html'
  });
})
.controller( 'SentimentAnalysisCtrl', function SentimentAnalysisController( $scope, $http, $stateParams, $analytics) {

	$scope.mapInit = mapInit;
	$scope.activeFilter = 'all';
	$scope.initFilter = initFilter;
	var pageTitle = $stateParams.pageTitle;
	$scope.pageTitle = pageTitle;
	var pageTitleJson = {pageTitle: pageTitle};

	var googleMap;
	var receivedMapData;
	var drawnDataPoints = [];
	//$scope.pageInit = pageInit;
	
	pageInit();


	function pageInit(){
		

		$http({
	      url: '/api/sentimentAnalysis/filterDataKeys',
	      method: 'GET',
	      params: pageTitleJson
	    }).then(function(response) {
	      var returnedData = response.data;

	      if(typeof(returnedData.All) == 'undefined'){
	      	returnedData.all = ['all'];
	      }
	      //console.log('returnedData: ',returnedData)
	        $scope.filterData = returnedData;
	        mapInit();
	      
	    }, function(error) {
	      //$scope.response = error.data;
	      //alert(error.data);
	      console.log('error getting filterKeys'+error.data);
	    });

		

	}

	

		
	

	function initFilter(filterKey){
		$scope.activeFilter = filterKey;
		//console.log(filterKey);
		for (var i = 0; i < drawnDataPoints.length; i++) {
			drawnDataPoints[i].setMap(null);

		};
		drawData(receivedMapData);
		$analytics.eventTrack('sentimentAnalysisFilter', {  category: pageTitle, label: filterKey });
	}

	function initSocket() {
	    
	    var socket = io.connect();

	    socket.on('connect', function () {
	    	
	    	//console.log("connected to server");
	    });

	    socket.emit('getSyncData', { getSyncData: pageTitleJson });//page initiializing. ask for syncData

	    var dataReceivedCount = 0;
	    socket.on('syncTData', function (receivedData) {//TODO when server restarts and sends data again. reInit map and draw new points. or ignore it completely
	    	receivedMapData = receivedData;
			//console.log("data received", receivedData);
			/*for (key in receivedData) {
	            
	            dataReceivedCount++;
	        }*/
			/*var lng = receivedData.coordinates.lng;
			var lat = receivedData.coordinates.lat;
			var averageSentiment = receivedData.averageSentiment;*/
			/*var marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat,lng),
				map: googleMap,
				title:"count: "+receivedData.tweetCount
			});*/
			

			/*dataReceivedCount++;*/
	      //console.log("averageSentiment: "+receivedData.averageSentiment);
	      //$('#data-received strong').text(dataReceivedCount);
	    	drawData(receivedMapData);

			socket.on('extTweet', function (data) {
	    	
		    	console.log("data received");
		    });
	    });

		/*	geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': 'LA'}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		    	console.log('geocoderaddress',results);
		    }
			});
	*/



	}

	function drawData(data){
		var activeFilter = $scope.activeFilter;
		var filteredData = data[activeFilter];

		for (key in filteredData) {
            var tMiniData = filteredData[key];
            drawDataPoint(tMiniData);
        }

	}

	function drawDataPoint(tMiniData){

		var lng = tMiniData.coordinates.lng;
		var lat = tMiniData.coordinates.lat;
		var averageSentiment = tMiniData.averageSentiment;//round it up to 2 decimal Math.round(num * 100) / 100
		
	    var high = [151, 83, 34];   // color of max negative sentiment
		var low = [5, 69, 54];  // color of max positive sentiment
		var minSnt = 0;
		var maxSnt = 2;
		var avgSnt = averageSentiment+maxSnt/2;//supporting sentiment range -2.5 to +2.5
		if(avgSnt<minSnt)
			avgSnt = minSnt;
		if(avgSnt>maxSnt)
			avgSnt = maxSnt;
	    var fraction = avgSnt / maxSnt;
	    var color = interpolateHsl(low, high, fraction);
	    
	    var circleDrawOptions = {
	      strokeColor: '#AEBFC7',
	      strokeOpacity: 0.8,
	      strokeWeight: 1,
	      fillColor: color,
	      fillOpacity: 0.4,
	      map: googleMap,
	      center: new google.maps.LatLng(lat,lng),
	      radius: tMiniData.radius,
	      zIndex: -tMiniData.tweetCount
	    };
	    // Add the circle to the map.
	    var tCircle = new google.maps.Circle(circleDrawOptions);
	    drawnDataPoints.push(tCircle);
	    google.maps.event.addListener(tCircle,'mouseover',function(){
	         this.getMap().getDiv().setAttribute('title', 'Count:'+tMiniData.tweetCount+' Sentiment:'+averageSentiment+' Topic:'+tMiniData.topic);});

	    google.maps.event.addListener(tCircle,'mouseout',function(){
	         this.getMap().getDiv().removeAttribute('title');});
	}

	function interpolateHsl(lowHsl, highHsl, fraction) {
	  var color = [];
	  for (var i = 0; i < 3; i++) {
	    // Calculate color based on the fraction.
	    color[i] = (highHsl[i] - lowHsl[i]) * fraction + lowHsl[i];
	  }

	  return 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)';
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
	//google.maps.event.addDomListener(window, 'load', mapInit);



});

