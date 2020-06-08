const { cwd } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Clean stack traces of build.command', async t => {
  const { returnValue } = await runFixture(t, 'build_command', { snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

test('Clean stack traces of plugin event handlers', async t => {
  const { returnValue } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.is(count, 1)
})

test('Does not clean stack traces of exceptions', async t => {
  const { returnValue } = await runFixture(t, 'exception', { snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.not(count, 1)
})

test('Clean stack traces of config validation', async t => {
  const { returnValue } = await runFixture(t, 'config_validation', { snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

const getStackLinesCount = function(returnValue) {
  return returnValue.split('\n').filter(isStackLine).length
}

const isStackLine = function(line) {
  return line.trim().startsWith('at ')
}

test('Clean stack traces from cwd', async t => {
  const { returnValue } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.false(returnValue.includes(`onPreBuild (${cwd()}`))
})

test('Clean stack traces but keep error message', async t => {
  const { returnValue } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.true(returnValue.includes('Error: test'))
})
