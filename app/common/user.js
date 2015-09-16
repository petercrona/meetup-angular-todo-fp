(function() {
    angular.module('todo.common')
        .factory('User', UserFactory);

    function User(email) {
        this.email = email;
    }
})();
