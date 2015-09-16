(function() {
    angular.module('todo.common')
        .service('SessionService', SessionService);

    var _;
    var prefix = 'user_session_';

    function SessionService(kling) {
        _ = kling;

        this.set = set;
        this.get = get;
        this.clear = clear;
    }

    function set(key, value) {
        return localStorage.setItem(withPrefix(key), JSON.stringify(value));
    }

    function get(key) {
        return _.Maybe(JSON.parse(localStorage.getItem(withPrefix(key))));
    }

    function clear() {
        var getAllWithPrefix = _.curry(_.reduce)(takeIfPrefix, []);
        var removeAll = _.curry(_.fmap)(function(value) {
            return localStorage.removeItem(value);
        });

        _.compose(removeAll, getAllWithPrefix)(Object.keys(localStorage));
    }

    function takeIfPrefix(memo, element) {
        if (element.indexOf(prefix) > -1) {
            memo.push(element);
        }

        return memo;
    }

    function withPrefix(key) {
        return prefix + key;
    }

})();
