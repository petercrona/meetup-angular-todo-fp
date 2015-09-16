var _ = kling;

(function(kling) {
    angular.module('todo', [
        'ui.router',
        'todo.components.dashboard',
        'todo.components.login',
        'todo.common'
    ])
        .constant('kling', kling)
        .controller('AppController', AppController);

    var vm;
    var _;
    var AuthServiceInstance;
    var state;

    function AppController(AuthService, kling, $state, $scope) {
        $scope.vm = {};
        vm = $scope.vm;
        _ = kling;
        AuthServiceInstance = AuthService;
        state = $state;

        init();
    }

    function init() {
        exposeMethodsToVm();

        getUserFromSession()
            .ifJust(setUserIsAuthenticated)
            .ifNothing(setUserIsGuest);

        registerLoginListener();
    }

    function registerLoginListener() {
        AuthServiceInstance.onLogin(function() {
            AuthServiceInstance.getUser().fmap(setUserInVm);
        });
    }

    function exposeMethodsToVm() {
        vm.logout = _.compose(setUserIsGuest, AuthServiceInstance.logout);
    }

    function getUserFromSession() {
        return _.do(_.Maybe)
            .write('user', AuthServiceInstance.getUser)
            .write('userIsValid', AuthServiceInstance.validateUserToken)
            .execute();
    }

    function setUserIsGuest(data) {
        vm.user = { name: 'Guest'};
        state.go('default.login');
    }

    function setUserIsAuthenticated(data) {
        setUserInVm(data.user);
        state.go('default.dashboard');
    }

    function setUserInVm(data) {
        vm.user = data;
    }

})(kling);
