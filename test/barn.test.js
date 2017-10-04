var Barn = require('../index');
var expect = require('chai').expect;

function createMockStorage(){
  return {
    s:{},
    length: 0,
    getItem: function(key){
      return (key in this.s) ? this.s[key] : null;
    },
    setItem: function(key, val){
      if(!(key in this.s)) this.length++;
      this.s[key] = ''+val;
    },
    removeItem: function(key){
      if(key in this.s) this.length--;
      delete this.s[key];
    },
    key: function(idx){
      return Object.keys(this.s)[idx] || null;
    },
    clear: function(){
      this.length = 0;
      var _this = this;
      Object.keys(this.s).forEach(function(key){
        _this.removeItem(key);
      });
    }
  };
}


describe('barn', function(){
  var barn;
  var storage;
  beforeEach(function(){
    storage = createMockStorage();
    barn = new Barn(storage);
  });
  describe('string operations', function(){
    it('set-get', function(){
      barn.set('key', 'val');
      barn.set('key2', 'val2');
      expect(barn.get('key')).to.equal('val');
      expect(barn.get('key2')).to.equal('val2');
    });
    describe('del', function(){
      it('del', function(){
        barn.set('key', 'val');
        expect(barn.get('key')).to.equal('val');
        expect(barn.del('key')).to.equal(1);
        expect(barn.get('key')).to.be.null;
      });
      it('del non existent key', function(){
        expect(barn.del('key')).to.equal(0);
      });
    });
  });
  describe('List operations', function(){
    describe('LPUSH', function(){
      it('LPUSH', function(){
        var len = barn.lpush('key', 'val');
        expect(len).to.equal(1);
        len = barn.lpush('key', 'val2');
        expect(len).to.equal(2);
      });
      it('LPUSH on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.lpush('key', 'val');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('LPOP', function(){
      it('LPOP', function(){
        var len = barn.lpush('key', 'val1');
        expect(len).to.equal(1);
        len = barn.lpush('key', 'val2');
        expect(len).to.equal(2);
        expect(barn.lpop('key')).to.equal('val2');
        expect(barn.lpop('key')).to.equal('val1');
      });
      it('LPOP on non existent list', function(){
        expect(barn.lpop('key')).to.be.null;
      });
      it('LPOP underflow', function(){
        var len = barn.lpush('key', 'val1');
        expect(len).to.equal(1);
        expect(barn.lpop('key')).to.equal('val1');
        expect(barn.lpop('key')).to.be.null;
      });
      it('LPOP on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.lpop('key');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('RPUSH', function(){
      it('RPUSH', function(){
        var len = barn.rpush('key', 'val');
        expect(len).to.equal(1);
        len = barn.rpush('key', 'val2');
        expect(len).to.equal(2);
      });
      it('RPUSH on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.rpush('key', 'val');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('RPOP', function(){
      it('RPOP', function(){
        var len = barn.rpush('key', 'val1');
        expect(len).to.equal(1);
        len = barn.rpush('key', 'val2');
        expect(len).to.equal(2);
        expect(barn.rpop('key')).to.equal('val2');
        expect(barn.rpop('key')).to.equal('val1');
      });
      it('RPOP on non existent list', function(){
        expect(barn.rpop('key')).to.be.null;
      });
      it('RPOP underflow', function(){
        var len = barn.rpush('key', 'val1');
        expect(len).to.equal(1);
        expect(barn.rpop('key')).to.equal('val1');
        expect(barn.rpop('key')).to.be.null;
      });
      it('RPOP on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.rpop('key');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('LLEN', function(){
      it('LLEN matches length returned from push', function(){
        var len;
        len = barn.rpush('key', 'val1');
        expect(barn.llen('key')).to.equal(len);
        len = barn.rpush('key', 'val2');
        expect(barn.llen('key')).to.equal(len);
        len = barn.rpush('key', 'val3');
        expect(barn.llen('key')).to.equal(len);
      });
      it('LLEN on non-existing list', function(){
        expect(barn.llen('noexist')).to.equal(0);
      });
      it('LLEN on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.llen('key');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('LRANGE', function(){
      beforeEach(function(){
        barn.rpush('key', 'val1');
        barn.rpush('key', 'val2');
        barn.rpush('key', 'val3');
      });
      it('first', function(){
        var range = barn.lrange('key', 0, 0);
        expect(range.length).to.equal(1);
        expect(range[0]).to.equal('val1');
      });
      it('out of range start index', function(){
        var range = barn.lrange('key', -3, 2);
        expect(range.length).to.equal(3);
        expect(range[0]).to.equal('val1');
        expect(range[1]).to.equal('val2');
        expect(range[2]).to.equal('val3');
      });
      it('out of range end index', function(){
        var range = barn.lrange('key', 0, 10);
        expect(range.length).to.equal(3);
        expect(range[0]).to.equal('val1');
        expect(range[1]).to.equal('val2');
        expect(range[2]).to.equal('val3');
      });
      it('completely out of range', function(){
        var range = barn.lrange('key', 3, 10);
        expect(range.length).to.equal(0);
      });
      it('negative end index', function(){
        var range = barn.lrange('key', 0, -1);
        expect(range.length).to.equal(3);
        expect(range[0]).to.equal('val1');
        expect(range[1]).to.equal('val2');
        expect(range[2]).to.equal('val3');
        range = barn.lrange('key', 0, -2);
        expect(range.length).to.equal(2);
        expect(range[0]).to.equal('val1');
        expect(range[1]).to.equal('val2');
      });
      it('LRANGE on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.lrange('key', 0, 0);}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
  });
  describe('Set operations', function(){
    describe('SADD', function(){
      it('SADD', function(){
        var numAdded = barn.sadd('key', 'val');
        expect(numAdded).to.equal(1);
      });
      it('returns number of added vals', function(){
        var numAdded = barn.sadd('key', 'val');
        expect(numAdded).to.equal(1);
        numAdded = barn.sadd('key', 'val2');
        expect(numAdded).to.equal(1);
        numAdded = barn.sadd('key', 'val2');
        expect(numAdded).to.equal(0);
      });
      it('on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.sadd('key', 'val');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('SMEMBERS', function(){
      it('SMEMBERS', function(){
        barn.sadd('key', 'val1');
        expect(barn.smembers('key').length).to.equal(1);
        barn.sadd('key', 'val2');
        expect(barn.smembers('key').length).to.equal(2);
        barn.sadd('key', 'val2');
        expect(barn.smembers('key').length).to.equal(2);
      });
      it('SMEMBERS on non existent set', function(){
        expect(barn.smembers('key')).to.be.null;
      });
      it('SMEMBERS on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.smebers('key');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('SREM', function(){
      it('SREM', function(){
        barn.sadd('key', 'val');
        var numRemoved = barn.srem('key', 'val');
        expect(numRemoved).to.equal(1);
      });
      it('returns number of removed vals', function(){
        barn.sadd('key', 'val');
        barn.sadd('key', 'val1');
        var numRemoved = barn.srem('key', 'val');
        expect(numRemoved).to.equal(1);
        numRemoved = barn.srem('key', 'val');
        expect(numRemoved).to.equal(0);
      });
      it('on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.srem('key', 'val');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
    describe('SISMEMBER', function(){
      it('SISMEMBER', function(){
        expect(barn.sismember('key', 'val1')).to.be.false;
        barn.sadd('key', 'val1');
        expect(barn.sismember('key', 'val1')).to.be.true;
        expect(barn.sismember('key', 'val2')).to.be.false;
        barn.sadd('key', 'val2');
        expect(barn.sismember('key', 'val2')).to.be.true;
      });
      it('SMEMBERS on non existent set', function(){
        expect(barn.sismember('key', 'val')).to.be.false;
      });
      it('SMEMBERS on string val', function(){
        barn.set('key', 'val');
        expect(function(){barn.sismebers('key', 'val');}).to.throw(TypeError);
        expect(barn.get('key')).to.equal('val');
      });
    });
  });
  describe('Persistence', function(){
    it('set-get', function(){
      barn.set('key', 'val');
      barn.set('key2', 'val2');
      var barn2 = new Barn(storage);
      expect(barn2.get('key')).to.equal('val');
      expect(barn2.get('key2')).to.equal('val2');
    });
    it('lpush-rpop', function(){
      barn.lpush('key', 'val');
      barn.lpush('key', 'val2');
      expect(barn.llen('key')).to.equal(2);
      barn.rpop('key');
      expect(barn.llen('key')).to.equal(1);
      var barn2 = new Barn(storage);
      expect(barn2.llen('key')).to.equal(1);
    });
    it('rpush-lpop', function(){
      barn.rpush('key', 'val');
      barn.rpush('key', 'val2');
      expect(barn.llen('key')).to.equal(2);
      barn.lpop('key');
      expect(barn.llen('key')).to.equal(1);
      var barn2 = new Barn(storage);
      expect(barn2.llen('key')).to.equal(1);
    });
    describe('Condensation', function(){
      it('should have the same db after condense', function(){
        barn.set('key', 'val');
        barn.condense();
        var barn2 = new Barn(storage);
        barn2.set('key2', 'val2');
        barn2.condense();
        var barn3 = new Barn(storage);
        barn3.set('key3', 'val3');
        expect(barn3.get('key')).to.equal('val');
        expect(barn3.get('key2')).to.equal('val2');
        expect(barn3.get('key3')).to.equal('val3');
      });
      it('should have only one key after condensation', function(){
        barn.set('key', 'val');
        barn.set('key1', 'val1');
        barn.set('key2', 'val2');
        expect(storage.length).to.equal(3 + 1);
        barn.condense();
        expect(storage.length).to.equal(1 + 1);
      });
      it('should autocondense when maxKeys is reached', function(){
        expect(storage.length).to.equal(1);
        for(var i=0; i<1000; i++){
          barn.set('key'+i, 'val'+i);
        }
        expect(storage.length).to.equal(1000 + 1);
        barn.set('keyX', 'valX');
        expect(storage.length).to.equal(1 + 1);
      });
      it('should autocondense when maxKeys is overridden and reached', function(){
        const max = 5;
        var s = createMockStorage();
        barn = new Barn('test', s, { maxKeys: max });
        expect(s.length).to.equal(1);

        for(var i=0; i<max; i++){
          barn.set('key'+i, 'val'+i);
        }
        expect(s.length).to.equal(5 + 1);
        barn.set('keyX', 'valX');
        expect(s.length).to.equal(1 + 1);
      });
    });
  });
});
