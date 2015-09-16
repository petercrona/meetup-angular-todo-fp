(function() {
    angular.module('todo.common')
        .service('TodoService', TodoService);

    var StorageServiceInstance;
    var _;
    var storage;
    var storageKey = 'todoItems';
    var listeners = [];
    var counter = 0;

    function TodoService(StorageService, kling) {
        _ = kling;
        StorageServiceInstance = StorageService;

        storage = [];
        StorageService.get(storageKey)
            .ifJust(setStorageToValue);

        this.add = add;
        this.getAll = getAll;
        this.onChange = onChange;
        this.remove = remove;
    }

    function remove(item) {
        var toDelete = getByIdFromStorage(item.id);
        toDelete.fmap(function(value) {
            var key = storage.indexOf(value);
            storage.splice(key, 1);
            StorageServiceInstance.set(storageKey, storage);
            informListeners();
        });
    }

    function getByIdFromStorage(id) {
        var res = _.reduce(function(memo, element) {
            if (element.id === id) {
                return element;
            } else {
                return memo;
            }
        }, null, storage);

        return _.Maybe(res);
    }

    function onChange(fn) {
        listeners.push(fn);
    }

    function informListeners() {
        _.fmap(function(fn) { fn(); }, listeners);
    }

    function setStorageToValue(restoredStorage) {
        storage = restoredStorage;
        counter = storage.length;
    }

    function add(todoItem) {
        storage.push({
            id: counter++,
            value: todoItem
        });
        StorageServiceInstance.set(storageKey, storage);

        informListeners();
    }

    function getAll() {
        return StorageServiceInstance.get(storageKey);
    }

})();
