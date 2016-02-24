var tup = require('../')

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
    done()
  })
})
