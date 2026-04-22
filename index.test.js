'use strict'
const test = require('ava')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')
const proxyquire = require('proxyquire').noCallThru()
const pkg = require('./package.json')

const cliPath = path.join(__dirname, 'cli.js')
const argvWith = (...tail) => [process.execPath, cliPath, ...tail]

const indexPath = path.join(__dirname, 'index.js')
const requireIndex = () => require(indexPath)
const idxStr = () => JSON.stringify(path.resolve(indexPath))

function runNode (code) {
  return execFileSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

function withExit (fn) {
  const origLog = console.log
  const origExit = process.exit
  const logs = []
  let exitCode
  const exit = c => {
    exitCode = c
    throw new Error('EXIT' + c)
  }
  console.log = m => {
    logs.push(m)
  }
  process.exit = exit
  try {
    return fn({ logs, getExit: () => exitCode })
  } finally {
    console.log = origLog
    process.exit = origExit
  }
}

async function waitForFile (filePath, timeoutMs) {
  const start = Date.now()
  for (;;) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
      return
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for ${filePath}`)
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 40))
  }
}

test('error: no message, with message, and empty string', t => {
  for (const expr of [
    `require(${idxStr()}).error()`,
    `require(${idxStr()}).error('m')`,
    `require(${idxStr()}).error('')`,
  ]) {
    const e = t.throws(
      () => {
        runNode(expr + '\n')
      },
      { name: 'Error' },
    )
    t.is(e.status, 1)
  }
})

test('resolveInput: returns glob; resolveOutput default and custom', t => {
  const j = requireIndex()
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-s-'))
  fs.writeFileSync(path.join(src, 'a.js'), 'x')
  const input = j.resolveInput(src)
  t.is(path.parse(input).ext, '.js')
  t.regex(input, /[/\\]\*\.js$/)
  t.not(input.indexOf('**'), -1)
  const defOut = j.resolveOutput(input, undefined)
  t.is(defOut, path.join(path.dirname(path.dirname(input)), 'compile'))
  const custom = path.join(src, 'dist')
  t.is(j.resolveOutput(input, custom), path.resolve(custom))
})

test('resolveInput: path does not exist', t => {
  const p = path.join(os.tmpdir(), 'missing-jscompile-' + Date.now() + '---')
  const e = t.throws(
    () => {
      runNode(`require(${idxStr()}).resolveInput(${JSON.stringify(p)});`)
    },
    { name: 'Error' },
  )
  t.is(e.status, 1)
})

test('resolveInput: not a directory', t => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-f-')), 'f.js')
  fs.writeFileSync(f, '1')
  const e = t.throws(
    () => {
      runNode(`require(${idxStr()}).resolveInput(${JSON.stringify(f)});`)
    },
    { name: 'Error' },
  )
  t.is(e.status, 1)
})

test('resolveInput: no .js in folder', t => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-txt-'))
  fs.writeFileSync(path.join(d, 'a.txt'), 'x')
  const e = t.throws(
    () => {
      runNode(`require(${idxStr()}).resolveInput(${JSON.stringify(d)});`)
    },
    { name: 'Error' },
  )
  t.is(e.status, 1)
})

test.serial(
  'jscompile: writes main.js to output',
  async t => {
    const j = requireIndex()
    const src = fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-ok-'))
    fs.writeFileSync(path.join(src, 'a.js'), 'var x = 1 + 2;')
    const out = path.join(src, 'out')
    const result = await j(src, out)
    t.is(result, out)
    const main = path.join(out, 'main.js')
    await waitForFile(main, 60000)
    t.true(fs.readFileSync(main, 'utf8').length > 0)
  },
  { timeout: 120000 },
)

test('jscompile: catch when gulp.src throws', async t => {
  const p = path.join(__dirname, 'index.js')
  const j = proxyquire(p, {
    gulp: {
      src: function () {
        throw new Error('gulp-fail')
      },
    },
  })
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-catch-'))
  fs.writeFileSync(path.join(src, 'a.js'), '1')
  const out = path.join(src, 'o')
  await t.throwsAsync(() => j(src, out), { message: 'gulp-fail' })
})

test('cli: --version, -v, --help, -h', t => {
  const cli = require('./cli')
  for (const flag of ['--version', '-v']) {
    withExit(ctx => {
      t.throws(
        () => {
          cli(argvWith(flag))
        },
        { message: 'EXIT0' },
      )
      t.is(ctx.getExit(), 0)
      t.is(ctx.logs[0], pkg.version)
    })
  }
  for (const flag of ['--help', '-h']) {
    withExit(ctx => {
      t.throws(
        () => {
          cli(argvWith(flag))
        },
        { message: 'EXIT0' },
      )
      t.is(ctx.getExit(), 0)
      t.true(String(ctx.logs[0] || '').includes('Usage:'))
    })
  }
})

test('cli: entry uses same behavior as cli(process.argv)', t => {
  const cli = require('./cli')
  const prev = process.argv
  process.argv = argvWith('-v')
  try {
    withExit(ctx => {
      t.throws(
        () => {
          cli(process.argv)
        },
        { message: 'EXIT0' },
      )
      t.is(ctx.getExit(), 0)
      t.is(ctx.logs[0], pkg.version)
    })
  } finally {
    process.argv = prev
  }
})

test.serial(
  'cli: invokes jscompile for input and output',
  async t => {
    const cli = require('./cli')
    const src = fs.mkdtempSync(path.join(os.tmpdir(), 'jsc-cli-'))
    fs.writeFileSync(path.join(src, 'a.js'), 'var y = 1;')
    const out = path.join(src, 'dist')
    cli(argvWith(src, out))
    const main = path.join(out, 'main.js')
    await waitForFile(main, 60000)
    t.true(fs.readFileSync(main, 'utf8').length > 0)
  },
  { timeout: 120000 },
)

test('subprocess: cli with no args exits 1 (missing input)', t => {
  const err = t.throws(
    () => {
      execFileSync(process.execPath, [cliPath], { stdio: 'pipe' })
    },
    { name: 'Error' },
  )
  t.is(err.status, 1)
})
