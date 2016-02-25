var tup = require('../..')

if (!process.env.T_UP_HASH) {
  process.env.T_UP_HASH = 'cookie'
}

tup(function (done) {
  console.log('this is a server')
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
