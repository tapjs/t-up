var tup = require('../')

tup(function (t) {
  console.error('in tup function')
  var http = require('http')
  http.createServer(function (req, res) {
    if (req.url === '/ping') {
      res.end('pong\n')
    } else {
      res.statusCode = 404
      res.end('not found\n')
    }
  }).listen(1337, function () {
    // t-up will wait until this process makes some kind of noise on
    // stdout.  this is to prevent moving on before you're ready.
    console.log('listening')
  })
})
