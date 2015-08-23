

var smap = null;
angular.module( 'wardolphMain.sentimentAnalysis', [
  'ui.router',
  'angulartics',
  'angulartics.google.analytics'
])
.config(function($stateProvider) {
  $stateProvider.state('sentimentAnalysis', {
    url: '/sentimentAnalysis/:pageTitle?timeSeriesEnabled',
    controller: 'SentimentAnalysisCtrl',
    templateUrl: '/partial/sentimentAnalysis/sentimentAnalysis.html'
  });
})
.controller( 'SentimentAnalysisCtrl', function SentimentAnalysisController( $scope, $http, $stateParams, $analytics) {

	//$scope.mapInit = mapInit;
	$scope.activeFilter = 'all';
	$scope.initFilter = initFilter;
	var pageTitle = $stateParams.pageTitle;
	var timeSeriesEnabled = $stateParams.timeSeriesEnabled;
	$scope.pageTitle = pageTitle;
	var pageTitleJson = {pageTitle: pageTitle};
	//console.log('timeseries: '+timeSeriesEnabled);
	var timeSliderVal = 7;
	if(timeSeriesEnabled){
		pageTitleJson.timeSeries = timeSliderVal;
		//console.log('timeseries enabled');
	}
	
	var socket = null;

	var googleMap;
	var receivedMapData;
	var drawnDataPoints = [];
	//$scope.pageInit = pageInit;
	
	initSocket();
	pageInit();
	

	//var smap = null;

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
	        smap = new SMap(getData);
	        smap.drawMap();
	        //mapInit();
	      
	    }, function(error) {
	      //$scope.response = error.data;
	      //alert(error.data);
	      console.log('error getting filterKeys'+error.data);
	    });

	    var getDataTimeOut = 0;
	    if(timeSeriesEnabled){
	    	$('.time-slider-container').show();
	    	$('.time-slider').slider({value:timeSliderVal});
			$('.time-slider').on('change', function(slideEvt) {
				timeSliderVal = slideEvt.value.newValue;
				pageTitleJson.timeSeries = timeSliderVal;
				if(getDataTimeOut){
					clearTimeout(getDataTimeOut);
				}
				getDataTimeOut = setTimeout(getData, 1000);
				//getData();
			});
	    }
		

	}
	

	function initFilter(filterKey){
		$scope.activeFilter = filterKey;
		//console.log(filterKey);
		//clearing old data
		smap.clearDrawnData();
		//drawing new data
		smap.drawData(receivedMapData[filterKey]);
		$analytics.eventTrack('sentimentAnalysisFilter', {  category: pageTitle, label: filterKey });
	}

	function initSocket() {
	    
	    socket = io.connect();

	    socket.on('connect', function () {
	    	
	    	//console.log("connected to server");
	    });

	    

	    var dataReceivedCount = 0;
	    socket.on('syncTData', function (receivedData) {//TODO when server restarts and sends data again. reInit map and draw new points. or ignore it completely
	    	receivedMapData = receivedData;
			var activeFilter = $scope.activeFilter;
			smap.clearDrawnData();
	    	smap.drawData(receivedMapData[activeFilter]);
			//console.log('time series data received : ',receivedData[activeFilter]);
	    });

	    socket.on('extTweet', function (data) {
	    	var activeFilter = $scope.activeFilter;
			//console.log("data received: "+data.topic);
			if(activeFilter=='all' || activeFilter == data.topic){
				smap.drawRealTimeData(data);
			}
		});

	}

	function getData(){
		socket.emit('getSyncData', { getSyncData: pageTitleJson});//page initiializing. ask for syncData
	}



});


			
			
		