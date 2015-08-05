'use strict'

const LRU = require('lru-cache')
const FS = require('fs')

class SmartCache {
  constructor(cacheOptions, cacheValidator, cacheFetcher) {
    if (!cacheOptions) {
      cacheOptions = {max: 500, maxAge: 1000 * 60 * 60 * 24}
    }
    this.cache = new LRU(cacheOptions)
    this.cacheStats = new Map()
    this.validate = cacheValidator || SmartCache.DefaultValidator
    this.fetch = cacheFetcher || SmartCache.DefaultFetcher
  }

  get(filePath) {
    const Me = this
    return this.validate(filePath, this.cacheStats.get(filePath))
      .then(function(newValue) {
        if (newValue !== false || !this.cache.has(filePath)) {
          return Me.fetch(filePath).then(function(contents) {
            Me.cache.set(filePath, contents)
            return contents
          })
        }
        return Me.cache.get(filePath)
      })
  }

  dispose() {
    this.cache.reset()
    this.cacheStats.clear()
  }

  // Return false to use previous result
  // Return anything else to be saved in oldValue and trigger fetch
  static DefaultValidator(filePath, oldValue) {
    const Deferred = Promise.defer()
    FS.stat(filePath, function(err, stats) {
      if (err) Deferred.resolve(false)
      else {
        const newValue = stats.ctime.toString()
        if (oldValue === newValue) Deferred.resolve(false)
        else Deferred.resolve(stats.ctime.toString())
      }
    })
    return Deferred.promise
  }

  static DefaultFetcher(filePath) {
    const Deferred = Promise.defer()
    FS.readFile(filePath, function(err, data) {
      if (err) Deferred.reject(err)
      else Deferred.resolve(data.toString())
    })
    return Deferred.promise
  }
}

module.exports = SmartCache
