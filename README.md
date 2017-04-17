# Barn

[![Build Status](https://travis-ci.org/arokor/barn.svg?branch=master)](https://travis-ci.org/arokor/barn)

Barn provides a redis like API on top of localStorage (or any other storage
implementing the web storage API). Operations are atomic so even if a users closes
the browser window, or and error is thrown and not handled barn keeps a consistent
state.

## Usage
    var barn = new Barn(localStorage);

    barn.set('key', 'val');
    console.log(barn.get('key')); // val

    barn.lpush('list', 'val1');
    barn.lpush('list', 'val2');
    console.log(barn.rpop('list')); // val1
    console.log(barn.rpop('list')); // val2

    barn.sadd('set', 'val1');
    barn.sadd('set', 'val2');
    barn.sadd('set', 'val3');
    console.log(barn.smembers('set')); // ['val1', 'val2', 'val3']
    barn.srem('set', 'val3');
    console.log(barn.smembers('set')); // ['val1', 'val2']

Follow [@AronKornhall](http://twitter.com/AronKornhall) for news and updates
regarding this library.

## Install
Browserify

    npm install barn

Browser

    bower install barn
    or just download dist/barn.js

## Test
    npm test

## Reference

### Barn({namespace}, storage)

Constructor to create a new Barn instance

__Arguments__
 
    namespace {String} an optional namespace parameter. Defaults to 'BARN' if not
              specified
    storage   {storage} any storage implementing the web storage API. This would
              normally be either localStorage or sessionStorage 

---------

### Barn##get(key)

get the store value for key

---------

### Barn##set(key, val)

set the store value for key

---------

### Barn##del(key)

delete the store value for key

---------

### Barn##lpop(listKey)

pop the leftmost value from list listKey

---------

### Barn##lpush(listKey, val)

push the value val to the left end of list listKey

---------

### Barn##rpop(listKey)

pop the rightmost value from list listKey

---------

### Barn##rpush(listKey, val)

push the value val to the right end of list listKey

---------

### Barn##llen(listKey)

get the length of a list

---------

### Barn##lrange(listKey, start, end)

get a range of elements from a list

---------

### Barn##sadd(setKey, val)

add value val to set setKey

---------

### Barn##smembers(setKey)

return an array containing all the items in set setKey

---------

### Barn##srem(setKey, val)

remove value val from set setKey

---------

### Barn##condense()

Condense the local storage representation of this Barn instance to save space
and speeds up initialization. This is done automatically from time to time so
normally there is no need to call this method explicitly.

---------

## License 

(The MIT License)

Copyright (c) 2014 Aron Kornhall <aron@kornhall.se>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
