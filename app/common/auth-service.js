(function() {
    angular.module('todo.common')
        .service('AuthService', AuthService);

    var _;
    var SessionServiceInstance;
    var listeners = [];

    function AuthService(kling, SessionService) {
        _ = kling;
        SessionServiceInstance = SessionService;

        this.login = login;
        this.logout = logout;
        this.validateUserToken = validateUserToken;
        this.getUser = getUser;
        this.onLogin = onLogin;
    }

    function onLogin(fn) {
        listeners.push(fn);
    }

    function login(credentials) {
        if (credentials.password.length > 10) {
            setLoginSession(credentials.email);
            informListeners();
            return _.Either(undefined, 'Login successfull');
        } else if (credentials.email.length < 20) {
            return _.Either('Incorrect email');
        } else {
            return _.Either('Incorrect password');
        }
    }

    function setLoginSession(email) {
        SessionServiceInstance.set('login', {
            name: 'Kalle',
            token: 'fdsafdas'
        });
    }

    function informListeners() {
        _.fmap(function(fn) { fn(); } , listeners);
    }

    function logout() {
        SessionServiceInstance.clear();
    }

    function getUser() {
        return SessionServiceInstance.get('login');
    }

    function validateUserToken(state) {
        return _.Maybe(true);
    }

})();
