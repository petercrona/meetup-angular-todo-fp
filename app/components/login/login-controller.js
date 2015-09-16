(function() {
    angular.module('todo.components.login', [
    ]).controller('LoginController', LoginController);

    var vm;
    var AuthServiceInstance;
    var state;

    function LoginController(AuthService, $scope, $state) {
        $scope.vm = {};
        vm = $scope.vm;
        AuthServiceInstance = AuthService;
        state = $state;

        init();
    }

    function init() {
        vm.login = _.compose(handleLoginResult, AuthServiceInstance.login);
    }

    function handleLoginResult(status) {
        status
            .ifError(writeErrorToVm)
            .ifSuccess(handleSuccessfullLogin);
    }

    function handleSuccessfullLogin(status) {
        state.go('default.dashboard');
    }

    function writeErrorToVm(status) {
        vm.error = status;
    }

})();
