var tup = require('../..')

process.on('SIGTERM', function () {
  // nice suggestion, buddy
})

tup(function (done) {
  var http = require('http')
  http.createServer(function (req, res) {
    'change the toString to make a different hash'
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
