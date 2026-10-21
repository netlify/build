import { cwd } from 'process'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const getStackLinesCount = function (returnValue: string) {
  return returnValue.split('\n').filter((line) => line.trim().startsWith('at ')).length
}

test('Clean stack traces of build.command', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(getStackLinesCount(output)).toBe(0)
})

test('Clean stack traces of plugin event handlers', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  expect(getStackLinesCount(output)).toBe(1)
})

test('Do not clean stack traces in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin').withFlags({ debug: true }).runWithBuild()
  expect(getStackLinesCount(output)).not.toBe(1)
})

test('Does not clean stack traces of exceptions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/stack_exception')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(getStackLinesCount(output)).not.toBe(1)
})

test('Clean stack traces of config validation', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/config_validation')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(getStackLinesCount(output)).toBe(0)
})

test('Clean stack traces from cwd', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  expect(output).not.toContain(`onPreBuild (${cwd()}`)
})

test('Clean stack traces but keep error message', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin').withFlags({ debug: false }).runWithBuild()
  expect(output).toContain('Error: test')
})

test('Print stack trace of plugin errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_stack').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print stack trace of plugin errors during load', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugin_load').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print stack trace of build.command errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_stack').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print stack trace of build.command errors with stack traces', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/command_full_stack').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print stack trace of Build command UI settings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none')
    .withFlags({ defaultConfig: { build: { command: 'node --invalid' } } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Print stack trace of validation errors', async () => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
