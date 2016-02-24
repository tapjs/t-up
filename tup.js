module.exports = tup
tup.close = close

var path = require('path')
var crypto = require('crypto')
var spawn = require('child_process').spawn
var fs = require('fs')

function sha (fn) {
  return crypto.createHash('sha256').update(fn.toString()).digest('hex')
}

function tup (fn) {
  var hash = sha(fn)
  if (process.env.T_UP_HASH === hash) {
    // already in child process, yay!
    fn(function (er) {
      if (er) {
        throw er
      } else {
        console.log('\nT-UP DONE %s\n', hash)
      }
    })
  } else {
    child(hash)
  }
}

function child (hash) {
  var cwd = process.cwd()
  var pidfile = path.resolve(cwd, '.t-up', hash)
  var t = require('tap')
  kill(pidfile)
  t.pass('killed pidfile ' + pidfile)

  var mkdirp = require('mkdirp')
  mkdirp.sync(cwd + '/.t-up/')

  var fd = fs.openSync(pidfile, 'wx')

  var args = process.execArgv.concat(process.argv.slice(1))
  var env = Object.keys(process.env).reduce(function (env, k) {
    if (!env[k]) {
      env[k] = process.env[k]
    }
    return env
  }, {
    T_UP_HASH: hash
  })

  var child = spawn(process.execPath, args, {
    env: env,
    cwd: cwd,
    stdio: [ 'ignore', 'pipe', 'pipe' ],
    detached: true
  })

  t.pass('spawned child, awaiting stdout data')

  fs.writeSync(fd, child.pid + '\n')

  child.stderr.pipe(process.stderr)

  var unrefed = false
  var out = ''
  child.stdout.on('data', function (c) {
    out += c
    if (out.split(/[\r\n]+/).indexOf('T-UP DONE ' + hash) !== -1) {
      unrefed = true
      child.unref()
      child.stdout.unref()
      child.stderr.unref()
    }
  })

  child.on('exit', function (exitCode, signal) {
    if (!unrefed) {
      t.fail('child process exited early', {
        exitCode: exitCode,
        signal: signal
      })
    }
  })
}

function kill (pidfile) {
  var t = require('tap')
  t.pass('kill(' + pidfile + ')')
  var rimraf = require('rimraf')
  try {
    var pid = fs.readFileSync(pidfile, 'utf8').trim()
  } catch (er) {
    t.pass('could not read pidfile, probably that is fine')
    return
  }

  try {
    process.kill(pid, 'SIGTERM')
  } catch (e) {
    if (e.code === 'ESRCH') {
      t.pass('process was not running')
    } else {
      t.error(e)
    }
  }

  rimraf.sync(pidfile)
  t.pass('removed pidfile')

  try {
    var piddir = path.dirname(pidfile)
    var files = fs.readdirSync(piddir)
    if (!files.length) {
      rimraf.sync(piddir)
    }
  } catch (e) {}

  // Give it 200ms, then make sure SIGTERM was enough
  // on windows, SIGTERM is the same as SIGKILL
  if (process.platform !== 'win32') {
    setTimeout(function () {
      var er
      try {
        process.kill(pid, 'SIGKILL')
      } catch (e) {
        er = e
      }
      if (!er) {
        t.fail('exit delayed, SIGKILL was required')
      } else if (er.code === 'ESRCH') {
        t.pass('exited successfully with SIGTERM')
      } else {
        throw er
      }
    }, 200)
  }
}

function close () {
  var dir = path.resolve(process.cwd(), '.t-up')
  try {
    var pidfiles = fs.readdirSync(dir)
  } catch (er) {
    return
  }

  pidfiles.forEach(function (pf) {
    kill(path.resolve(dir, pf))
  })
}
