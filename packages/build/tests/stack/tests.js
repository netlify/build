import { cwd } from 'process'

import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('Clean stack traces of build.command', async (t) => {
  const { returnValue } = await runFixture(t, 'build_command', {
    flags: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

test('Clean stack traces of plugin event handlers', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.is(count, 1)
})

test('Do not clean stack traces in debug mode', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: true }, snapshot: false, normalize: false })
  const count = getStackLinesCount(returnValue)
  t.not(count, 1)
})

test('Does not clean stack traces of exceptions', async (t) => {
  const { returnValue } = await runFixture(t, 'stack_exception', {
    flags: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.not(count, 1)
})

test('Clean stack traces of config validation', async (t) => {
  const { returnValue } = await runFixture(t, 'config_validation', {
    false: { debug: false },
    snapshot: false,
    normalize: false,
  })
  const count = getStackLinesCount(returnValue)
  t.is(count, 0)
})

const getStackLinesCount = function (returnValue) {
  return returnValue.split('\n').filter(isStackLine).length
}

const isStackLine = function (line) {
  return line.trim().startsWith('at ')
}

test('Clean stack traces from cwd', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  t.false(returnValue.includes(`onPreBuild (${cwd()}`))
})

test('Clean stack traces but keep error message', async (t) => {
  const { returnValue } = await runFixture(t, 'plugin', { flags: { debug: false }, snapshot: false, normalize: false })
  t.true(returnValue.includes('Error: test'))
})

test('Print stack trace of plugin errors', async (t) => {
  await runFixture(t, 'plugin_stack')
})

test('Print stack trace of plugin errors during load', async (t) => {
  await runFixture(t, 'plugin_load')
})

test('Print stack trace of build.command errors', async (t) => {
  await runFixture(t, 'command_stack')
})

test('Print stack trace of build.command errors with stack traces', async (t) => {
  await runFixture(t, 'command_full_stack')
})

test('Print stack trace of Build command UI settings', async (t) => {
  const defaultConfig = { build: { command: 'node --invalid' } }
  await runFixture(t, 'none', { flags: { defaultConfig } })
})

test('Print stack trace of validation errors', async (t) => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})
