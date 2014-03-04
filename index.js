'use strict';

var Promise = null;

module.exports =
  {
    use: function(promise){
      Promise = promise;
    },
    sequenceOf: sequenceOf,
    sequenceWithParallelism: sequenceWithParallelism
  };

function sequenceOf(functionToCall) {
  return function(tasks) {
    var current = Promise.cast();
    return Promise.map(tasks, function(task) {
      current = current.then(function() {
        return functionToCall(task);
      });
      return current;
    });
  };
}

function sequenceWithParallelism(parallelism, functionToCall) {
  return function(tasks) {
    var queued = [];
    return Promise.map(tasks, function(task) {
      var mustComplete = Math.max(0, queued.length - parallelism + 1);
      var current = Promise.some(queued, mustComplete).then(function() {
        return functionToCall(task);
      });
      queued.push(current);
      return current;
    });
  };
}