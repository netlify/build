const { cwd } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Clean stack traces of lifecycle commands', async t => {
  const { all } = await runFixture(t, 'lifecycle', { snapshot: false, normalize: false })
  const count = getStackLinesCount(all)
  t.is(count, 0)
})

test('Clean stack traces of plugin event handlers', async t => {
  const { all } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  const count = getStackLinesCount(all)
  t.is(count, 1)
})

test('Does not clean stack traces of exceptions', async t => {
  const { all } = await runFixture(t, 'exception', { snapshot: false, normalize: false })
  const count = getStackLinesCount(all)
  t.not(count, 1)
})

test('Clean stack traces of config validation', async t => {
  const { all } = await runFixture(t, 'config_validation', { snapshot: false, normalize: false })
  const count = getStackLinesCount(all)
  t.is(count, 0)
})

const getStackLinesCount = function(all) {
  return all.split('\n').filter(isStackLine).length
}

const isStackLine = function(line) {
  return line.trim().startsWith('at ')
}

test('Clean stack traces from cwd', async t => {
  const { all } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.false(all.includes(`onInit (${cwd()}`))
})

test('Clean stack traces but keep error message', async t => {
  const { all } = await runFixture(t, 'plugin', { snapshot: false, normalize: false })
  t.true(all.includes('Error: test'))
})
