

angular.module( 'wardolphMain.blog', [
  'ui.router',
  'angulartics',
  'angulartics.google.analytics'
])
.config(function($stateProvider) {
  $stateProvider.state('blog', {
    url: '/blog',
    controller: 'BlogCtrl',
    templateUrl: '/partial/blog/blog.html'
  });
})
.controller( 'BlogCtrl', function BlogController( $scope, $http, $stateParams, $analytics) {

	


});

