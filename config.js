(function() {
    angular.module('todo').config(configureApp);

    function configureApp($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('default', {
                url: '/',
                templateUrl: 'app/templates/default.html',
                controller: 'AppController',
                controllerAs: 'appController'
            })
            .state('default.dashboard', {
                url: 'dashboard',
                templateUrl: 'app/components/dashboard/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'dashboard'
            })
            .state('default.login', {
                url: 'login',
                templateUrl: 'app/components/login/login.html',
                controller: 'LoginController',
                controllerAs: 'login',
            });
    }
})();
