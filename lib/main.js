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
    return this.validate(filePath, this.cacheStats.get(filePath))
      .then(newValue => {
        if (newValue !== false || !this.cache.has(filePath)) {
          this.cacheStats.set(filePath, newValue)
          return this.fetch(filePath).then(contents => {
            this.cache.set(filePath, contents)
            return contents
          })
        }
        return this.cache.get(filePath)
      })
  }

  dispose() {
    this.cache.reset()
    this.cacheStats.clear()
  }

  // Return false to use previous result
  // Return anything else to be saved in oldValue and trigger fetch
  static DefaultValidator(filePath, oldValue) {
    return new Promise(function(resolve) {
      FS.stat(filePath, function(err, stats) {
        if (err) resolve(false)
        else {
          const newValue = stats.ctime.toString()
          resolve(oldValue === newValue ? false : newValue)
        }
      })
    })
  }

  static DefaultFetcher(filePath) {
    return new Promise(function(resolve, reject) {
      FS.readFile(filePath, function(err, data) {
        if (err) reject(err)
        else resolve(data.toString())
      })
    })
  }
}

module.exports = SmartCache
