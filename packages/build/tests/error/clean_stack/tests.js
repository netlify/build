const { cwd } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Clean stack traces of lifecycle commands', async t => {
  const { stdout } = await runFixture(t, 'lifecycle', { snapshot: false, normalize: false })
  const count = getStackLinesCount(stdout)
  t.is(count, 0)
})

test('Clean stack traces of plugin event handlers', async t => {
  const { stdout } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  const count = getStackLinesCount(stdout)
  t.is(count, 1)
})

test('Does not clean stack traces of exceptions', async t => {
  const { stdout } = await runFixture(t, 'exception', { snapshot: false, normalize: false })
  const count = getStackLinesCount(stdout)
  t.not(count, 1)
})

test('Clean stack traces of config validation', async t => {
  const { stdout } = await runFixture(t, 'config_validation', { snapshot: false, normalize: false })
  const count = getStackLinesCount(stdout)
  t.is(count, 0)
})

const getStackLinesCount = function (stdout) {
  return stdout.split('\n').filter(isStackLine).length
}

const isStackLine = function (line) {
  return line.trim().startsWith('at ')
}

test('Clean stack traces from cwd', async t => {
  const { stdout } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.false(stdout.includes(`onInit (${cwd()}`))
})

test('Clean stack traces but keep error message', async t => {
  const { stdout } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.true(stdout.includes('Error: test'))
})
