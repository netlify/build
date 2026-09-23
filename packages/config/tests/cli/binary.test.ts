import { fileURLToPath } from 'url'

import { Fixture } from '@netlify/testing'
import { execa } from 'execa'
import { expect, test } from 'vitest'

import { asConfig } from '../helpers/result.js'

const INVALID_CONFIG_PATH = fileURLToPath(new URL('invalid', import.meta.url))
const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))
const BINARY_PATH = fileURLToPath(new URL('../../bin.js', import.meta.url))

const parseOutput = (output: string) => asConfig(JSON.parse(output))

test('Exits with 0 on success', async () => {
  const { exitCode } = await new Fixture(import.meta.url, './fixtures/empty').runConfigBinary()
  expect(exitCode).toBe(0)
})

test('Exits with 1 on a user error, printing only its message', async () => {
  const { output, exitCode } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ config: INVALID_CONFIG_PATH })
    .runConfigBinary()
  expect(exitCode).toBe(1)
  expect(output).toBe(`When resolving config file ${INVALID_CONFIG_PATH}:\nConfiguration file does not exist`)
})

test('Exits with 2 on a bug, printing its stack', async () => {
  // Current behaviour: an empty --output is a file path, not stdout, and writing to it fails as a bug.
  const { output, exitCode } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ output: '' })
    .runConfigBinary()
  expect(exitCode).toBe(2)
  expect(output).toMatch(/^Error: ENOENT[^\n]*\n\s+at /)
})

test('The JSON output has no token, and hasApi last when there is a token', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: true }, stable: false })
    .runConfigBinary()
  const keys = Object.keys(parseOutput(output))
  expect(keys).not.toContain('token')
  expect(keys.at(-1)).toBe('hasApi')
})

test('The JSON output has no hasApi without a token', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty').runConfigBinary()
  const keys = Object.keys(parseOutput(output))
  expect(keys).not.toContain('token')
  expect(keys).not.toContain('hasApi')
})

test('Prints only JSON on stdout, and warnings on stderr', async () => {
  const repositoryRoot = `${FIXTURES_DIR}/redirects_warning`
  const { stdout, stderr, exitCode } = await execa(
    'node',
    [BINARY_PATH, `--repositoryRoot=${repositoryRoot}`, '--branch=branch'],
    { cwd: repositoryRoot, env: { NETLIFY_AUTH_TOKEN: '' }, reject: false },
  )
  expect(exitCode).toBe(0)
  expect(stderr).toContain('Warning: some redirects have syntax errors')
  expect(parseOutput(stdout)).toHaveProperty('branch', 'branch')
})

test('--configMutations, given as one JSON array string, mutates the config', async () => {
  const configMutations = [{ keys: ['build', 'command'], value: 'from the binary', event: 'onPreBuild' }]
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ configMutations: JSON.stringify(configMutations) })
    .runConfigBinary()
  expect(parseOutput(output)).toHaveProperty(['config', 'build', 'command'], 'from the binary')
})
