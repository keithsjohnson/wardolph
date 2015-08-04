

angular.module( 'wardolphMain', [
  'wardolphMain.home',
  'wardolphMain.login',
  'wardolphMain.sentimentAnalysis',
  'wardolphMain.admin',
  'wardolphMain.blog',
  'angular-jwt',
  'angular-storage',
  'ui.bootstrap',
  'angulartics',
  'angulartics.google.analytics'
])
.config( function myAppConfig ($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $analyticsProvider) {
  $urlRouterProvider.otherwise('/sentimentAnalysis/feminism');

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('jwt');
  }

  $httpProvider.interceptors.push('jwtInterceptor');
})
.run(function($rootScope, $state, store, jwtHelper) {
  $rootScope.$on('$stateChangeStart', function(e, to) {
    if (to.data && to.data.requiresLogin) {
      if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
        e.preventDefault();
        $state.go('login');
      }
    }
  });
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$routeChangeSuccess', function(e, nextRoute){
    if ( nextRoute.$$route && angular.isDefined( nextRoute.$$route.pageTitle ) ) {
      $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Wardolph' ;
    }
  });
})

;




