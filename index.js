var _ = require('underscore');
var Barn = require('./lib/barn');

function API(namespace, storage, opts){
  if (!opts) opts = {};
  if(!storage){
    storage = namespace;
    namespace = 'BARN';
  }
  this.barn = new Barn(namespace, storage, opts);
}

_.extend(API.prototype, {
  get: function(key){
    return this.barn.execCmd('GET', key);
  },
  set: function(key, val){
    return this.barn.execCmd('SET', key, val);
  },
  del: function(key){
    return this.barn.execCmd('DEL', key);
  },
  lpop: function(key){
    return this.barn.execCmd('LPOP', key);
  },
  lpush: function(key, val){
    return this.barn.execCmd('LPUSH', key, val);
  },
  rpop: function(key){
    return this.barn.execCmd('RPOP', key);
  },
  rpush: function(key, val){
    return this.barn.execCmd('RPUSH', key, val);
  },
  llen: function(key){
    return this.barn.execCmd('LLEN', key);
  },
  lrange: function(key, start, end){
    return this.barn.execCmd('LRANGE', key, start, end);
  },
  sadd: function(key, val){
    return this.barn.execCmd('SADD', key, val);
  },
  smembers: function(key){
    return this.barn.execCmd('SMEMBERS', key);
  },
  sismember: function(key, val){
    return this.barn.execCmd('SISMEMBER', key, val);
  },
  srem: function(key, val){
    return this.barn.execCmd('SREM', key, val);
  },
  condense: function(){
    return this.barn.condense();
  },
});

module.exports = API;
