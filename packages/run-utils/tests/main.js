const test = require('ava')
const execa = require('execa')
const { valid: validVersion } = require('semver')

const run = require('..')

const FIXTURES_DIR = `${__dirname}/fixtures`
const RUN_FILE = `${FIXTURES_DIR}/run.js`

const runInChildProcess = function(command, options) {
  const optionsA = options === undefined ? [] : [JSON.stringify(options)]
  return execa('node', [RUN_FILE, command, ...optionsA])
}

test('Should expose several methods', t => {
  t.is(typeof run, 'function')
  t.is(typeof run.command, 'function')
})

test('Can run a command as a single string', async t => {
  const { stdout } = await run.command('ava --version', { stdio: 'pipe' })
  t.truthy(validVersion(stdout))
})

test('Can run with no arguments', async t => {
  const { stdout } = await run('echo', { stdio: 'pipe' })
  t.is(stdout.trim(), '')
})

test('Can run with no arguments nor options object', async t => {
  const { stdout } = await run('echo')
  t.is(stdout.trim(), '')
})

test('Can run local binaries', async t => {
  const { stdout } = await run('ava', ['--version'], { stdio: 'pipe' })
  t.truthy(validVersion(stdout))
})

test('Should redirect stdout/stderr to parent', async t => {
  const { stdout } = await runInChildProcess('ava --version')
  t.truthy(validVersion(stdout))
})

test('Should not redirect stdout/stderr to parent when using "stdio" option', async t => {
  const { stdout } = await runInChildProcess('ava --version', { stdio: 'pipe' })
  t.is(stdout, '')
})

test('Should not redirect stdout/stderr to parent when using "stdout" option', async t => {
  const { stdout } = await runInChildProcess('ava --version', { stdout: 'pipe' })
  t.is(stdout, '')
})

test('Should not redirect stdout/stderr to parent when using "stderr" option', async t => {
  const { stdout } = await runInChildProcess('ava --version', { stderr: 'pipe' })
  t.is(stdout, '')
})
