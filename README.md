Smart-Cache
==========

[![Greenkeeper badge](https://badges.greenkeeper.io/steelbrain/smart-cache.svg)](https://greenkeeper.io/)

Smart-Cache is a tiny nodejs fs caching module that fits everywhere, It supports custom validate and fetch functions so You can use it for network mounts or efficient network downloads in your apps.

My personal use case was that I was working on a nodejs assets server that automatically transpiles the contents, and for that I needed and efficient yet strong and reliable cache, Tara! Smart-Cache was born.

#### API
```js
class SmartCache<TVal, TCompare>{
  constructor(?LRUOptions, ?cacheValidator<TCompare>, ?cacheFetcher<TVal>)
  get(filePath):Promise<TVal>
  dispose():void
  static DefaultValidator<TCompare>(filePath, oldValue):Promise<TCompare>
  static DefaultFetcher<TVal>(filePath):Promise<TVal>
}
```

#### Example
```js
const SmartCache = require('smart-cache')
const smartCache = new SmartCache
smartCache.get("/etc/passwd").then(function(contents){
  console.log(contents)
})
```

#### License
This project is licensed under the terms of MIT License. See the LICENSE file for more info.
