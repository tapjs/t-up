var t = require('tap')
var http = require('http')

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
