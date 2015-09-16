(function() {
    angular.module('todo.components.dashboard', [
    ]).controller('DashboardController', DashboardController);

    var vm;
    var TodoServiceInstance;

    function DashboardController(TodoService, $scope) {
        $scope.vm = {};
        vm = $scope.vm;
        TodoServiceInstance = TodoService;

        exposeMethodsToVm();
        registerTodoListener();
        init();
    }

    function registerTodoListener() {
        TodoServiceInstance.onChange(init);
    }

    function exposeMethodsToVm() {
        vm.addItem = _.compose(clearItemInVm, addItem);
        vm.removeItem = TodoServiceInstance.remove;
    }

    function init() {
        vm.todoItems = [];
        TodoServiceInstance.getAll()
            .ifJust(setTodosToView);
    }

    function clearItemInVm() {
        vm.itemToAdd = '';
    }

    function addItem(todoItem) {
        TodoServiceInstance.add(todoItem);
    }

    function setTodosToView(todos) {
        vm.todoItems = todos.reverse();
    }

})();
