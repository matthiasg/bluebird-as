'use strict';

var assert = require('assert');
var util = require('util');

var Promise = require('bluebird');

module.exports =
  {
    use: function(promise){
      Promise = promise;
    },
    sequenceOf: sequenceOf,
    sequenceWithParallelism: sequenceWithParallelism
  };

function sequenceOf(functionToCall) {
  return sequenceWithParallelism(1,functionToCall);
}

function sequenceWithParallelism(parallelism, functionToCall) {
  return function(tasks) {

    var currentItem = 0;

    return new Promise(function(resolve){
     
      parallelism = Math.min( tasks.length, parallelism );

      if(parallelism === 0){
        return resolve(tasks.length);
      }

      var active = 0;

      for (var slotIndex = 0; slotIndex < parallelism; slotIndex++) {
        processNextTask();
      }

      function processNextTask(){

        if(currentItem >= tasks.length){
          if(active === 0 )
            return resolve();
          else
            return;
        }

        var task = tasks[currentItem];
        currentItem++;
        active++;

        assert(active<=parallelism, util.format('ERROR->active exceeding parallelism',active,parallelism));

        Promise.resolve( processTask(task) )
          .finally(function(){
            active--;
            processNextTask();
          });
      }

      function processTask(task){

        return new Promise(function(resolve,reject){
          try {
            resolve(functionToCall(task));
          } catch(error) {
            console.error('ERROR: Exception in callback, the callback should handle that internally',task);
            reject(error);
          }
        });

      }
    });
  };
}