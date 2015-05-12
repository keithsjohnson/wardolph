angular.module( 'wardolphMain.home', [
  'ui.router'
])
.config(function($stateProvider) {
  $stateProvider.state('home', {
    url: '/home',
    controller: 'HomeCtrl',
    templateUrl: '/partial/home/home.html',
    data: {
      requiresLogin: true
    }
  });
})
.controller( 'HomeCtrl', function HomeController( $scope, $http) {

  $scope.callAnonymousApi = function() {
    // Just call the API as you'd do using $http
    callApi('Anonymous', '/api/random-quote');
  }

  $scope.callSecuredApi = function() {
    callApi('Secured', '/api/protected/random-quote');
  }

  function callApi(type, url) {
    $scope.response = null;
    $scope.api = type;
    $http({
      url: url,
      method: 'GET'
    }).then(function(quote) {
      $scope.response = quote.data;
    }, function(error) {
      $scope.response = error.data;
    });
  }

});
