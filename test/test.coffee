Promise = require('bluebird')
as = require('..')
as.use(Promise)

describe 'Higher Level Functions on top of bluebird (Promise Library)', ->

  it 'can execute in sequence', (done)->

    previousItem = 0
    items = ( i for i in [1..20] )

    workOnItem = (item)->
      return Promise.delay(Math.random()*10).then ()->
        if previousItem != item - 1
          throw new Error("Execution was not in sequence. Expected previous item to be #{item-1} but was #{previousItem}")
        previousItem = item

    Promise.cast(items)
      .then as.sequenceOf(workOnItem)
      .then ()->
        previousItem.should.equal(items.length)
        done()


  it 'can execute in sequence with some parallelism', (done)->

    items = ( i for i in [1..50] )
    
    concurrent = 0
    count = 0
    maxConcurrentCalls = 0

    PARALLELISM = 5

    workOnItem = (item)->
      concurrent++
      if concurrent > PARALLELISM
        throw new Error("Too many concurrent executions ##{concurrent}")

      maxConcurrentCalls = Math.max(concurrent,maxConcurrentCalls)
        
      return Promise.delay(Math.random()*10).finally ()->
        concurrent--
        if concurrent < 0
          throw new Error("Something went wrong. Concurrent calls should not be less than 0")
        count++

    Promise.cast(items)
      .then as.sequenceWithParallelism(PARALLELISM,workOnItem)
      .then ()->
        maxConcurrentCalls.should.equal(PARALLELISM)
        count.should.equal(items.length)
        done()



