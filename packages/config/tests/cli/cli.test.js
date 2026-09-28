import { readFile, rm, writeFile } from 'fs/promises'
import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import isCI from 'is-ci'
import { tmpName as getTmpName } from 'tmp-promise'
import { expect, test } from 'vitest'

const INVALID_CONFIG_PATH = fileURLToPath(new URL('invalid', import.meta.url))
const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('--help', async () => {
  const { output } = await new Fixture().withFlags({ help: true }).runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--version', async () => {
  const { output } = await new Fixture().withFlags({ version: true }).runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Success', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty').runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('User error', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ config: INVALID_CONFIG_PATH })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('CLI flags', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ branch: 'test' })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Stabilitize output with the --stable flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ stable: true })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not stabilitize output without the --stable flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ stable: false })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Write on file with the --output flag', async () => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    await new Fixture(import.meta.url, './fixtures/empty').withFlags({ output }).runConfigBinary()
    const content = await readFile(output)
    const { context } = JSON.parse(content)
    expect(context).toBe('production')
  } finally {
    await rm(output, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Do not write on stdout with the --output flag', async () => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    const result = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ output }).runConfigBinary()
    expect(result.output).toBe('')
  } finally {
    await rm(output, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Write on stdout with the --output=- flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ output: '-' }).runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Ignores nonspecified config', async () => {
  const { output } = await new Fixture().withFlags({ cwd: `${FIXTURES_DIR}/toml` }).runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Ignores empty config', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/toml').withFlags({ config: '' }).runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Check --config for toml', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/toml')
    .withFlags({ cwd: `${FIXTURES_DIR}/toml`, config: `apps/nested/netlify.toml` })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

// This test is too slow in local development
if (isCI) {
  test('Handles big outputs', async () => {
    const fixturesDir = normalize(`${fileURLToPath(import.meta.url)}/../fixtures`)
    const bigNetlify = `${fixturesDir}/big/netlify.toml`

    await rm(bigNetlify, { force: true, recursive: true, maxRetries: 10 })
    try {
      const bigContent = getBigNetlifyContent()
      await writeFile(bigNetlify, bigContent)
      const { output } = await new Fixture(import.meta.url, './fixtures/big')
        .withFlags({ output: '-' })
        .runConfigBinary()
      expect(() => {
        JSON.parse(output)
      }).not.toThrow()
    } finally {
      await rm(bigNetlify, { force: true, recursive: true, maxRetries: 10 })
    }
  })

  const getBigNetlifyContent = function () {
    const envVars = Array.from({ length: BIG_NUMBER }, getEnvVar).join('\n')
    return `[build.environment]\n${envVars}`
  }

  const BIG_NUMBER = 1e4
}

const getEnvVar = function (value, index) {
  return `TEST${index} = ${index}`
}
