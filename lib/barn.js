"use strict";
var NSStorage = require('nsstorage');
var _ = require('underscore');

function Barn(namespace, storage, opts){
  var _this = this;
  this._storage = NSStorage.createNamespace(namespace, storage);
  this._keys = {};
  this._idx = 0;
  this._keySet;
  this._opts = {
    maxKeys: 1000
  };

  _.extend(this._opts, opts);

  this._cmds = {
    DEL: {
      fn: function(key){
        var count = 0;
        _this._keys[key] && count++;
        delete _this._keys[key];
        return count;
      },
      mutating: true
    },
    GET: {
      fn: function(key){
        return _this._getValExpectingType(key, 'string');
      },
      mutating: false
    },
    SET: {
      fn: function(key, val){
        _this._keys[key] = {
          val: val,
          type: 'string'
        };
      },
      mutating: true
    },
    LPUSH: {
      fn: function(key, val){
        var list = _this._getOrCreateList(key);
        list.unshift(val);
        return list.length;
      },
      mutating: true
    },
    LPOP: {
      fn: function(key){
        var list = _this._getValExpectingType(key, 'list');
        var ret = null;
        if(list && list.length){
          ret = list.shift();
        }
        return ret;
      },
      mutating: true
    },
    RPUSH: {
      fn: function(key, val){
        var list = _this._getOrCreateList(key);
        list.push(val);
        return list.length;
      },
      mutating: true
    },
    RPOP: {
      fn: function(key){
        var list = _this._getValExpectingType(key, 'list');
        var ret = null;
        if(list && list.length){
          ret = list.pop();
        }
        return ret;
      },
      mutating: true
    },
    LLEN: {
      fn: function(key){
        var list = _this._getValExpectingType(key, 'list');
        return list ? list.length : 0;
      },
      mutating: false
    },
    LRANGE: {
      fn: function(key, start, end){
        var list = _this._getValExpectingType(key, 'list');
        var ret = null;
        if(list && list.length){
          start = Math.max(0, start);
          if(end === -1){
            end = undefined;
          }else{
            end++;
          }
          ret = list.slice(start, end);
        }
        return ret;
      },
      mutating: false
    },
    SADD: {
      fn: function(key, val){
        var numAdded = 0;
        var set = _this._getOrCreateSet(key);
        if(!(val in set)){
          numAdded++;
          set[val] = true;
        }
        return numAdded;
      },
      mutating: true
    },
    SMEMBERS: {
      fn: function(key){
        var set = _this._getValExpectingType(key, 'set');
        var ret = null;
        if(set){
          ret = Object.keys(set);
        }
        return ret;
      },
      mutating: false
    },
    SISMEMBER: {
      fn: function(key, val){
        var set = _this._getValExpectingType(key, 'set');
        return !!(set && set[val]);
      },
      mutating: false
    },
    SREM: {
      fn: function(key, val){
        var numRemoved = 0;
        var set = _this._getOrCreateSet(key);
        if(val in set){
          numRemoved++;
          delete set[val];
        }
        return numRemoved;
      },
      mutating: true
    },
    _LOAD: {
      fn: function(data){
        _this._keys = data;
      },
      mutating: true
    }
  };

  this._load();
}

Barn.prototype._getVal = function(key){
  return this._keys[key];
};

Barn.prototype._getValExpectingType = function(key, type){
  var val = this._getVal(key);
  if(val){
    if(val.type !== type)
      throw new TypeError('Expected key '+key+' to be of type '+type);
    return val.val;
  }else{
    return null;
  }
};

Barn.prototype._getOrCreateList = function(key){
  var val = this._getValExpectingType(key, 'list');
  if(!val){
    val = [];
    this._keys[key] = {
      type: 'list',
      val: val
    };
  }
  return val;
};

Barn.prototype._getOrCreateSet = function(key){
  var val = this._getValExpectingType(key, 'set');
  if(!val){
    val = {};
    this._keys[key] = {
      type: 'set',
      val: val
    };
  }
  return val;
};

Barn.prototype._loadKeySet = function(){
  this._keySet = this._storage.getItem('KEYSET');
  if(!this._keySet) this._setKeySet(0);
};

Barn.prototype._setKeySet = function(val){
  this._storage.setItem('KEYSET', val);
  this._keySet = val;
};

Barn.prototype._isGarbage = function(key){
  return key.indexOf(this._keySet) !== 0 && key !== 'KEYSET';
};

Barn.prototype._buildKey = function(ks, i){
  return ks + '_' + i;
};

Barn.prototype._load = function(){
  this._loadKeySet();
  this._keys = {};
  this._idx = 0;
  var op;
  do{
    var key = this._buildKey(this._keySet, this._idx);
    op = this._storage.getItem(key);
    if(op){
      this._idx++;
      this._exec(JSON.parse(op));
    }
  }while(op);
};

Barn.prototype._exec = function(op){
  var cmd = this._cmds[op.cmd].fn;
  if(!cmd) throw new Error('Invalid operation');
  return cmd.apply(null, op.args);
};

Barn.prototype._save = function(ks, i, op){
  var key = this._buildKey(ks, i);
  var val = JSON.stringify(op);
  this._storage.setItem(key, val);
};

Barn.prototype._isMutating = function(cmd){
  return this._cmds[cmd].mutating;
};

// High level API
Barn.prototype.execCmd = function(){
  var args = Array.prototype.slice.call(arguments);
  var cmd = args.shift();
  var op = {
    cmd: cmd,
    args: args
  };
  var ret = this._exec(op);
  if(this._isMutating(cmd)){
    this._save(this._keySet, this._idx, op);
    this._idx++;
    if(this._idx>this._opts.maxKeys){
      this.condense();
    }
  }
  return ret;
};

Barn.prototype._gc = function(){
  var _this = this;
  var garbage = [];
  var key;
  for(var i=0; i<this._storage.length; i++){
    key = this._storage.key(i);
    if(this._isGarbage(key)){
      garbage.push(key);
    }
  }
  garbage.forEach(function(it){
    _this._storage.removeItem(it);
  });
};

Barn.prototype.condense = function(){
  var op = {
    cmd: '_LOAD',
    args: [this._keys]
  };
  this._save(+this._keySet+1, 0, op);
  this._setKeySet(+this._keySet+1);
  this._idx = 1;
  this._gc();
};

module.exports = Barn;
