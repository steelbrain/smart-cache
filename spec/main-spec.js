'use strict'
describe('smart-cache', function() {
  const SmartCache = require('../')
  let smartCache = null

  beforeEach(function() {
    if (smartCache !== null) smartCache.dispose()
    smartCache = new SmartCache()
  })
  it('works', function() {
    waitsForPromise(function() {
      let timeStart = new Date()
      let Diff
      return smartCache.get(`${__dirname}/fixtures/test.txt`).then(function(contents) {
        expect(contents).toBe(`something\n`)
        Diff = new Date() - timeStart
        timeStart = new Date()
        return smartCache.get(`${__dirname}/fixtures/test.txt`)
      }).then(function(contents) {
        expect(contents).toBe(`something\n`)
        expect(new Date() - timeStart).toBeLessThan(Diff)
        return smartCache.get(`${__dirname}/fixtures/test.txt`)
      })
    })
  })
})
