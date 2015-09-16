(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = chunksOf;

function chunksOf(itemsPerChunk, list) {
    var result = [];

    for (var i = 0; i < list.length; i = i + itemsPerChunk) {
        var toGet = [];

        for (var j = i; j < i + itemsPerChunk && j < list.length; j++) {
            toGet.push(list[j]);
        }

        if (toGet.length > 0) {
            result.push(toGet);
        }
    }

    if (result.length === 0) {
        result.push([]);
    }

    return result;
}

},{}],2:[function(require,module,exports){
module.exports = compose;

function compose() {
    var fns = arguments;

    if (fns.length > 0) {
        return composeFunctions(fns);
    }
}

function composeFunctions(fns) {
    return function(result) {
        var nrFns = fns.length;
        for (var i = nrFns-1; i >= 0; i--) {
            result = fns[i](result);
        }

        return result;
    }

}

},{}],3:[function(require,module,exports){
module.exports = curry;

curry._dependencies = ['identity', 'fmap'];

function curry(fn) {
    var nrArgsRequired = fn.length;
    var argsArray = getArgs(arguments).splice(1);
    return generateAccumulator(fn, argsArray, nrArgsRequired);
}

function generateAccumulator(fn, args, nrArgsRequired) {
    return function() {
        var newArgs = arguments;
        var allArgs = addNewArgs(args, newArgs);

        if (getNrOfSetArgs(allArgs) < nrArgsRequired) {
            return generateAccumulator(fn, allArgs, nrArgsRequired);
        } else {
            return fn.apply(null, allArgs);
        }
    }
}

function getArgs(args) {
    return curry.fmap(curry.identity, args);
}

function getNrOfSetArgs(args) {
    return args
        .filter(isNotUndefined)
        .length;
}

function isNotUndefined(value) {
    return value !== undefined;
}

function addNewArgs(args, newArgs) {
    var newArgsArray = getArgs(newArgs);

    var result = fillUndefinedAndGetRemainingNewArgs(args, newArgsArray);
    var remainingNewArgs = result.remaining;
    args = result.withNewArgs;

    return args.concat(remainingNewArgs);
}

function fillUndefinedAndGetRemainingNewArgs(args, newArgs) {
    var nrArgs = args.length;
    args = curry.fmap(
        takeAndSetArgIfUndefined.bind(null, newArgs),
        args);

    return {
        withNewArgs: args,
        remaining: newArgs
    };
}

function takeAndSetArgIfUndefined(newArgs, currentArg) {
    if (currentArg === undefined) {
        return newArgs.shift();
    } else {
        return currentArg;
    }
}

},{}],4:[function(require,module,exports){
module.exports = fmap;

function fmap(fn, obj) {
    if (!obj) {
        return;
    }

    if (obj.constructor === Array) {
        return obj.map(fn)
    } else {
        return mapOnObject(fn, obj);
    }
}

function mapOnObject(fn, obj) {
    var values = getValues(obj);
    return fmap(fn, values);
}

function getValues(obj) {
    var keys = Object.keys(obj);
    return keys.map(getValue);

    function getValue(key) {
        return obj[key];
    }
}

},{}],5:[function(require,module,exports){
module.exports = reduce;

function reduce(fn, memo, list) {
    var nrItems = list.length;

    for (var i in list) {
        memo = fn(memo, list[i]);
    }

    return memo;
}

},{}],6:[function(require,module,exports){
module.exports = workflow;

function workflow(monad) {
    if ( ! (this instanceof workflow) ) {
        return new workflow(monad);
    }

    var store = {};
    var jobQueue = [];

    this.write = write;
    this.execute = execute;
    this.run = run;

    function write(key, monadicValue) {
        jobQueue.push(new Job(key, monadicValue));
        return this;
    }

    function run(fn) {
        execute().bind(fn)
        return this;
    }

    function execute() {
        var setValueInState = _.curry(function(key, value) {
            store[key] = value;
            return store;
        });

        var jobQueueLength = jobQueue.length;
        var currentStep = jobQueue[0].monadicValue;

        if (typeof currentStep === 'function') {
            var monadicValue = currentStep(store);
            mustBeCompatibleType(monadicValue, monad);
            currentStep = monadicValue.bind(function(value) {
                setValueInState(jobQueue[0].key, value);
                return value;
            });
        } else {
            currentStep = currentStep.bind(function(value) {
                setValueInState(jobQueue[0].key, value);
                return value;
            });
        }

        for (var i = 1; i < jobQueueLength; i++) {
            var job = jobQueue[i];

            currentStep.bind(function() {

                if (typeof job.monadicValue === 'function') {
                    var monadicValue = job.monadicValue(store);
                    mustBeCompatibleType(monadicValue, monad);

                    monadicValue.bind(function(value) {
                        setValueInState(job.key, value);
                        currentStep = currentStep.bind(function() {
                            return value;
                        });
                    });
                    currentStep = monadicValue;

                } else {
                    currentStep = currentStep.bind(function() {
                        job.monadicValue.bind(setValueInState(job.key));
                    });
                    currentStep = job.monadicValue;
                }
            });

        }

        return currentStep.bind(function() {
            return store;
        });
    }
}

function Job(key, monadicValue) {
    this.key = key;
    this.monadicValue = monadicValue;
}

function mustBeCompatibleType(monadicValue, monad) {
    if ( ! (monadicValue instanceof monad) ) {
        throw "Tried to write incompatible data to monad";
    }
}

},{}],7:[function(require,module,exports){
module.exports = zip;

zip._dependencies = ['reduce'];

function zip(listA, listB) {
    var listBReversed = listB.reverse();

    return _.reduce(mergeWithB, [], listA);

    function mergeWithB(memo, elementFromA) {
        memo.push(elementFromA);
        memo.push(listB.pop());
        return memo;
    }
}

},{}],8:[function(require,module,exports){
var kling = module.exports = {};

if (window) {
    window.kling = kling;
}

kling = loadCore();
kling = loadDependent();
kling = kling.fmap(injectAllDependencies, kling);

function loadCore() {
    kling.identity = identity;
    kling.Maybe = require('./types/maybe.js');
    kling.Either = require('./types/either.js');
    kling.foldr = require('./functions/reduce.js');
    kling.compose = require('./functions/compose.js');
    kling.do = require('./functions/run.js');
    return kling;
}

function loadDependent() {
    kling.fmap = require('./functions/fmap.js');
    kling.curry = require('./functions/curry.js');
    kling.reduce = require('./functions/reduce.js');
    kling.zip = require('./functions/zip.js');
    kling.chunksOf = require('./functions/chunks_of.js');
    return kling;
}

function injectAllDependencies(module) {
    var dependencies = new kling.Maybe(module._dependencies)
        .fmap(injectDependencies);

    dependencies.fmap(addAllDependenciesToModule.bind(null, module));

    return module;
}

function addAllDependenciesToModule(module, dependencies) {
    kling.fmap(
        addMaybeDependencyToModule.bind(null, module),
        dependencies);
}

function addMaybeDependencyToModule(module, maybeDependency) {
    maybeDependency.fmap(
        addDependencyToModule.bind(null, module)
    );
}

function addDependencyToModule(module, dependency) {
    module[dependency.name] = dependency;
}

function injectDependencies(dependencies) {
    return kling.fmap(injectDependency, dependencies);
}

function injectDependency(dependency) {
    return new kling.Maybe(kling[dependency]);
}

function identity(x) {
    return x;
}

},{"./functions/chunks_of.js":1,"./functions/compose.js":2,"./functions/curry.js":3,"./functions/fmap.js":4,"./functions/reduce.js":5,"./functions/run.js":6,"./functions/zip.js":7,"./types/either.js":9,"./types/maybe.js":10}],9:[function(require,module,exports){
module.exports = Either;

function Either(error, value) {
    if ( ! (this instanceof Either)) {
        return new Either(error, value);
    }

    this.fmap = fmap;
    this.isError = isError;
    this.ifError = ifError;
    this.ifSuccess = ifSuccess;
    this.bind = bind;

    function fmap(fn) {
        if (this.isError()) {
            return new Either(error);
        } else {
            return new Either(undefined, fn(value));
        }
    }

    function isError() {
        return error && (value === undefiend || value === null);
    }

    function ifError(fn) {
        if (isError()) {
            fn(error);
        }
        return this;
    }

    function ifSuccess(fn) {
        if (!isError()) {
            fn(value);
        }
        return this;
    }

    function isError() {
        return value === undefined;
    }

    function bind(fn) {
        if (isError()) {
            return new Either(error, undefined);
        } else {
            return new Either(error, fn(value));
        }

    }

}

},{}],10:[function(require,module,exports){
module.exports = Maybe;

function Maybe(result) {
    if ( ! (this instanceof Maybe)) {
        return new Maybe(result);
    }

    this.ifJust = ifJust;
    this.ifNothing = ifNothing;
    this.fmap = fmap;
    this.bind = bind;

    function fmap(fn) {
        if (result !== undefined && result !== null) {
            return Maybe(fn(result));
        } else {
            return Maybe();
        }
    }

    function ifJust(fn) {
        if (result !== undefined && result !== null) {
            fn(result);
        }
        return this;
    }

    function ifNothing(fn) {
        if (result === undefined || result === null) {
            fn();
        }
        return this;
    }

    function bind(fn) {
        if (result !== undefined && result !== null) {
            return new Maybe(fn(result));
        } else {
            return new Maybe();
        }

    }

}

},{}]},{},[8]);
