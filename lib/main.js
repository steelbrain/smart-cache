'use strict'

const LRU = require('lru-cache')
const FS = require('fs')

class SmartCache {
  constructor() {

  }

  static DefaultValidator(filePath, oldInfo) {
    const Deferred = Promise.defer()
    FS.stat(filePath, function(err, stats) {
      if (err) Deferred.resolve(NaN)
      else Deferred.resolve(stats.ctime.toString())
    })
    return Deferred.promise
  }

  static DefaultGetter(filePath) {
    const Deferred = Promise.defer()
    FS.readFile(filePath, function(err, data) {
      if (err) Deferred.reject(err)
      else Deferred.resolve(data.toString())
    })
    return Deferred.promise
  }
}

module.exports = SmartCache
