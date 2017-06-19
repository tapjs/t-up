var t = require('tap')
var Test = t.Test
var glob = require('glob')

t.test('basic success case', function (t) {
  runTest(t, 'success', {
    plan: {
      start: 1,
      end: 4
    },
    count: 4,
    pass: 4,
    ok: true
  })
})

t.test('env with a pre-existing T_UP_HASH', function (t) {
  runTest(t, 'env-polluted', {
    plan: {
      start: 1,
      end: 4
    },
    count: 4,
    pass: 4,
    ok: true
  })
})

t.test('ignore SIGTERM case', function (t) {
  runTest(t, 'ignore-sigterm', {
    plan: {
      start: 1,
      end: 4
    },
    count: 4,
    pass: 3,
    ok: false,
    fail: 1
  })
})

t.test('exit early', function (t) {
  runTest(t, 'exit-early', {
    plan: {
      start: 1,
      end: 4
    },
    count: 4,
    pass: 1,
    ok: false,
    fail: 3
  })
})

t.test('two things', function (t) {
  t.test('one process', function (t) {
    runTest(t, 'two-things-one-process', {
      plan: {
        start: 1,
        end: 4
      },
      count: 4,
      pass: 1,
      ok: false,
      fail: 3
    })
  })
  t.test('two processes', function (t) {
    runTest(t, 'two-things-two-processes', {
      plan: {
        start: 1,
        end: 5
      },
      count: 5,
      pass: 5,
      ok: true
    })
  })
  t.end()
})

t.test('callback error', function (t) {
  runTest(t, 'callback-error', {
    plan: {
      start: 1,
      end: 4
    },
    count: 4,
    pass: 1,
    ok: false,
    fail: 3
  })
})

function runTest (t, folder, expect) {
  var tt = new Test({ name: folder })
  var out = ''
  tt.on('data', function (c) {
    out += c
  })
  var set = glob.sync(__dirname + '/' + folder + '/*.js')
  set.forEach(function (f) {
    tt.spawn(process.execPath, [f], { stdio: ['pipe', 'pipe', 'ignore'] })
  })
  tt.end()
  tt.on('complete', function (results) {
    t.match(results, expect)
    t.end()
  })
}
