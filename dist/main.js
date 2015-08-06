'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LRU = require('lru-cache');
var FS = require('fs');

var SmartCache = (function () {
  function SmartCache(cacheOptions, cacheValidator, cacheFetcher) {
    _classCallCheck(this, SmartCache);

    if (!cacheOptions) {
      cacheOptions = { max: 500, maxAge: 1000 * 60 * 60 * 24 };
    }
    this.cache = new LRU(cacheOptions);
    this.cacheStats = new Map();
    this.validate = cacheValidator || SmartCache.DefaultValidator;
    this.fetch = cacheFetcher || SmartCache.DefaultFetcher;
  }

  _createClass(SmartCache, [{
    key: 'get',
    value: function get(filePath) {
      var _this = this;

      return this.validate(filePath, this.cacheStats.get(filePath)).then(function (newValue) {
        if (newValue !== false || !_this.cache.has(filePath)) {
          _this.cacheStats.set(filePath, newValue);
          return _this.fetch(filePath).then(function (contents) {
            _this.cache.set(filePath, contents);
            return contents;
          });
        }
        return _this.cache.get(filePath);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.cache.reset();
      this.cacheStats.clear();
    }

    // Return false to use previous result
    // Return anything else to be saved in oldValue and trigger fetch
  }], [{
    key: 'DefaultValidator',
    value: function DefaultValidator(filePath, oldValue) {
      return new Promise(function (resolve) {
        FS.stat(filePath, function (err, stats) {
          if (err) resolve(false);else {
            var newValue = stats.ctime.toString();
            resolve(oldValue === newValue ? false : newValue);
          }
        });
      });
    }
  }, {
    key: 'DefaultFetcher',
    value: function DefaultFetcher(filePath) {
      return new Promise(function (resolve, reject) {
        FS.readFile(filePath, function (err, data) {
          if (err) reject(err);else resolve(data.toString());
        });
      });
    }
  }]);

  return SmartCache;
})();

module.exports = SmartCache;