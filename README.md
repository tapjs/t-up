# t-up

Tee up a test server in one file, tear it down in another

This makes it easy to set up a server or child process in a test file
called `00-setup.js` or something, and then tear it down in
`zz-teardown.js`, so that you can get the benefits of running your
tests in separate files, but still bang on the same server across the
entire suite.

## USAGE

You may have a setup file that starts a server, like so:

```javascript
// 00-setup.js
var tup = require('t-up')

tup(function (done) {
  var http = require('http')
  http.createServer(function (req, res) {
    if (req.url === '/ping') {
      res.end('pong\n')
    } else {
      res.statusCode = 404
      res.end('not found\n')
    }
  }).listen(1337, function () {
    // standard node-style callback
    // if you call this with an error, it'll blow up
    done()
  })
})
```

Then, a bunch of tests that do things to that server:

```javascript
// test-ping.js
var t = require('tap')
var http = require('http')

t.test('ping returns pong', function (t) {
  http.get('http://localhost:1337/ping', function (res) {
    t.equal(res.statusCode, 200)
    var pong = ''
    res.on('data', function (d) { pong += d })
    res.on('end', function () {
      t.equal(pong, 'pong\n')
      t.end()
    })
  })
})
```

And of course, a negative test:

```javascript
// test-blerg.js
t.test('anything else 404s', function (t) {
  http.get('http://localhost:1337/blerg', function (res) {
    t.equal(res.statusCode, 404)
    var pong = ''
    res.on('data', function (d) { pong += d })
    res.on('end', function () {
      t.equal(pong, 'not found\n')
      t.end()
    })
  })
})
```

Last but not least, tear down the server when you're done:

```javascript
// zz-teardown.js
var tup = require('t-up')
tup.close()
```

## CAVEATS

- The module that calls `t-up` should probably not do anything else.
  It's going to be run a second time in a child process, so any other
  side-effects are bad.
- You should use [tap](http://node-tap.org) for your tests, since this
  module will output some TAP notes about how it's going.
- Definitely clean up after yourself!  If you don't ever call
  `tup.close()`, then you'll have a bunch of node processes lying
  arouhnd.
- The server MUST print something to standard output (console.log or
  whatever) when it's ready to move onto the next test.  This prevents
  a race condition where the tests fail because the server isn't up
  yet.  Otherwise, all stdio is completely lost, because the child
  process is abandoned without access to that stuff.
