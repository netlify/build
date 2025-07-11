import { readFile, rm, writeFile } from 'fs/promises'
import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import isCI from 'ci-info'
import { tmpName as getTmpName } from 'tmp-promise'

const INVALID_CONFIG_PATH = fileURLToPath(new URL('invalid', import.meta.url))
const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('--help', async (t) => {
  const { output } = await new Fixture().withFlags({ help: true }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('--version', async (t) => {
  const { output } = await new Fixture().withFlags({ version: true }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Success', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('User error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ config: INVALID_CONFIG_PATH }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('CLI flags', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ branch: 'test' }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Stabilitize output with the --stable flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ stable: true }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Does not stabilitize output without the --stable flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ stable: false }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Write on file with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    await new Fixture('./fixtures/empty').withFlags({ output }).runConfigBinary()
    const content = await readFile(output)
    const { context } = JSON.parse(content)
    t.is(context, 'production')
  } finally {
    await rm(output, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Do not write on stdout with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    const result = await new Fixture('./fixtures/empty').withFlags({ output }).runConfigBinary()
    t.is(result.output, '')
  } finally {
    await rm(output, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Write on stdout with the --output=- flag', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ output: '-' }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Ignores nonspecified config', async (t) => {
  const { output } = await new Fixture().withFlags({ cwd: `${FIXTURES_DIR}/toml` }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Ignores empty config', async (t) => {
  const { output } = await new Fixture('./fixtures/toml').withFlags({ config: '' }).runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('Check --config for toml', async (t) => {
  const { output } = await new Fixture('./fixtures/toml')
    .withFlags({ cwd: `${FIXTURES_DIR}/toml`, config: `apps/nested/netlify.toml` })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

// This test is too slow in local development
if (isCI) {
  test('Handles big outputs', async (t) => {
    const fixturesDir = normalize(`${fileURLToPath(test.meta.file)}/../fixtures`)
    const bigNetlify = `${fixturesDir}/big/netlify.toml`

    await rm(bigNetlify, { force: true, recursive: true, maxRetries: 10 })
    try {
      const bigContent = getBigNetlifyContent()
      await writeFile(bigNetlify, bigContent)
      const { output } = await new Fixture('./fixtures/big').withFlags({ output: '-' }).runConfigBinary()
      t.notThrows(() => {
        JSON.parse(output)
      })
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
