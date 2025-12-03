import { cwd } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

const getStackLinesCount = function (returnValue) {
  return returnValue.split('\n').filter((line) => line.trim().startsWith('at ')).length
}

test.serial('Clean stack traces of build.command', async (t) => {
  const output = await new Fixture('./fixtures/build_command').withFlags({ debug: false }).runWithBuild()
  t.is(getStackLinesCount(output), 0)
})

test('Clean stack traces of plugin event handlers', async (t) => {
  const output = await new Fixture('./fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  t.is(getStackLinesCount(output), 1)
})

test('Do not clean stack traces in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/plugin').withFlags({ debug: true }).runWithBuild()
  t.not(getStackLinesCount(output), 1)
})

test('Does not clean stack traces of exceptions', async (t) => {
  const output = await new Fixture('./fixtures/stack_exception').withFlags({ debug: false }).runWithBuild()
  t.not(getStackLinesCount(output), 1)
})

test('Clean stack traces of config validation', async (t) => {
  const output = await new Fixture('./fixtures/config_validation').withFlags({ debug: false }).runWithBuild()
  t.is(getStackLinesCount(output), 0)
})

test('Clean stack traces from cwd', async (t) => {
  const output = await new Fixture('./fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  t.false(output.includes(`onPreBuild (${cwd()}`))
})

test('Clean stack traces but keep error message', async (t) => {
  const output = await new Fixture('./fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  t.true(output.includes('Error: test'))
})

test('Print stack trace of plugin errors', async (t) => {
  const output = await new Fixture('./fixtures/plugin_stack').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print stack trace of plugin errors during load', async (t) => {
  const output = await new Fixture('./fixtures/plugin_load').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print stack trace of build.command errors', async (t) => {
  const output = await new Fixture('./fixtures/command_stack').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print stack trace of build.command errors with stack traces', async (t) => {
  const output = await new Fixture('./fixtures/command_full_stack').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print stack trace of Build command UI settings', async (t) => {
  const output = await new Fixture('./fixtures/none')
    .withFlags({ defaultConfig: { build: { command: 'node --invalid' } } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Print stack trace of validation errors', async (t) => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})
