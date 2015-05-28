angular.module( 'wardolphMain.admin', [
  'ui.router'
])
.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    controller: 'AdminCtrl',
    templateUrl: '/partial/admin/admin.html',
    data: {
      requiresLogin: true
    }
  });
})
.controller( 'AdminCtrl', function AdminController( $scope, $http) {



  $scope.nodes = ['node1','node2','node3'];

  $scope.getPeerValues = function() {

    // Just call the API as you'd do using $http
    callApi('Secured', '/api/protected/peers');
  }

  $scope.callAnonymousApi = function() {
    // Just call the API as you'd do using $http
    callApi('Anonymous', '/api/random-quote');
  }

  $scope.callSecuredApi = function() {
    callApi('Secured', '/api/protected/random-quote');
  }

  $scope.updatePeers = function() {
    $http({
      url: '/api/protected/peers',
      method: 'POST',
      data: $scope.peerData
    }).then(function(response) {
      var returnedData = response.data

      //$scope.$watch(function () {
        /*for(key in $scope.peerData){
          delete $scope.peerData[key];
        }
        for(key in returnedData){
          console.log("jzTest2: ",returnedData[key]);
          $scope.peerData[key] = returnedData[key];
        }*/
        $scope.peerData = returnedData;
        
      //});
      
      $scope.response = "Peer Data updated"
      //store.set('jwt', response.data.id_token);
      //$state.go('admin');
    }, function(error) {
      $scope.response = error.data;
      //alert(error.data);
      console.log(error.data);
    });
  }

  function callApi(type, url) {
    $http({
      url: url,
      method: 'GET'
    }).then(function(response) {
      
      $scope.peerData = response.data;
      $scope.response = 'node data returned';
    }, function(error) {

      $scope.response = error.data;
      console.log(error.data);
    });
  }

});
