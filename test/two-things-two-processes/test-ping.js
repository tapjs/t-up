var t = require('tap')
var http = require('http')

t.test('ping returns pong', function (t) {
  http.get('http://localhost:15444/ping', function (res) {
    t.equal(res.statusCode, 200)
    var pong = ''
    res.on('data', function (d) { pong += d })
    res.on('end', function () {
      t.equal(pong, 'pong\n')
      t.end()
    })
  })
})
