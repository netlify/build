import { Fixture, normalizeOutput } from '@netlify/testing'
import * as colors from 'ansis'
import hasAnsi from 'has-ansi'
import { expect, test } from 'vitest'

test('Colors in parent process', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/parent')
    .withFlags({ dry: true })
    .withEnv({ FORCE_COLOR: '1' })
    .runBuildBinary()
  expect(hasAnsi(output)).toBe(true)
})

test('Colors in child process', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/child')
    .withEnv({ FORCE_COLOR: '1' })
    .runBuildBinary()
  expect(output).toContain(colors.red('onPreBuild'))
})

test('Netlify CI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/parent')
    .withFlags({ dry: true, mode: 'buildbot' })
    .withEnv({ FORCE_COLOR: '1' })
    .runBuildBinary()
  expect(hasAnsi(output)).toBe(true)
})

test('No TTY', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/parent')
    .withFlags({ dry: true })
    .withEnv({ FORCE_COLOR: '0' })
    .runBuildBinary()
  expect(hasAnsi(output)).toBe(false)
})

test('Logs whether the build commands came from the UI', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { build: { command: 'node --invalid' } } })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('The verbose flag enables verbosity', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/verbose').withFlags({ verbose: true }).runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Verbosity works with plugin errors', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/verbose_error')
    .withFlags({ verbose: true })
    .runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not truncate long headers in logs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/truncate_headers').runWithBuild()
  expect(output).not.toContain('999')
})

test('Does not truncate long redirects in logs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/truncate_redirects').runWithBuild()
  expect(output).not.toContain('999')
})

test('Accepts a custom log function', async () => {
  const logs: string[] = []
  const logger = (message: string) => {
    logs.push(message)
  }
  const result = await new Fixture(import.meta.url, './fixtures/with_plugin_and_functions')
    .withFlags({ logger, verbose: true })
    .runBuildProgrammatic()

  expect(result.logs?.stdout).toEqual([])
  expect(result.logs?.stderr).toEqual([])

  expect(logs.length).toBeGreaterThan(0)

  // From main logic.
  expect(logs.some((log) => log.includes('Netlify Build'))).toBe(true)
  expect(logs.some((log) => log.includes('onPreBuild'))).toBe(true)

  // From core step.
  expect(logs.some((log) => log.includes('Packaging Functions from '))).toBe(true)

  // From plugin.
  expect(logs.some((log) => log.includes('Step started.'))).toBe(true)
  expect(logs.some((log) => log.includes('Step ended.'))).toBe(true)
})
