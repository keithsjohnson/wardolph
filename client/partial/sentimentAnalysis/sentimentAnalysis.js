

var smap = null;
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

	//$scope.mapInit = mapInit;
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
	        smap = new SMap(initSocket);
	        smap.drawMap();
	        //mapInit();
	      
	    }, function(error) {
	      //$scope.response = error.data;
	      //alert(error.data);
	      console.log('error getting filterKeys'+error.data);
	    });

		

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
	    
	    var socket = io.connect();

	    socket.on('connect', function () {
	    	
	    	//console.log("connected to server");
	    });

	    socket.emit('getSyncData', { getSyncData: pageTitleJson });//page initiializing. ask for syncData

	    var dataReceivedCount = 0;
	    socket.on('syncTData', function (receivedData) {//TODO when server restarts and sends data again. reInit map and draw new points. or ignore it completely
	    	receivedMapData = receivedData;
			
	    	smap.drawData(receivedMapData['all']);

			socket.on('extTweet', function (data) {
	    	
		    	console.log("data received");
		    	smap.drawRealTimeData(data);
		    });
	    });




	}

	



});


			
			
		