import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

import test from 'ava'
import del from 'del'
import isCI from 'is-ci'
import { tmpName as getTmpName } from 'tmp-promise'

import { runFixture, FIXTURES_DIR } from '../helpers/main.js'

const INVALID_CONFIG_PATH = fileURLToPath(new URL('invalid', import.meta.url))

test('--help', async (t) => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async (t) => {
  await runFixture(t, '', { flags: { version: true }, useBinary: true })
})

test('Success', async (t) => {
  await runFixture(t, 'empty', { useBinary: true })
})

test('User error', async (t) => {
  await runFixture(t, 'empty', { flags: { config: INVALID_CONFIG_PATH }, useBinary: true })
})

test('CLI flags', async (t) => {
  await runFixture(t, 'empty', { flags: { branch: 'test' }, useBinary: true })
})

test('Stabilitize output with the --stable flag', async (t) => {
  await runFixture(t, 'empty', { flags: { stable: true }, useBinary: true })
})

test('Does not stabilitize output without the --stable flag', async (t) => {
  await runFixture(t, 'empty', { flags: { stable: false }, useBinary: true })
})

test('Write on file with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    await runFixture(t, 'empty', { flags: { output }, useBinary: true, snapshot: false })
    const content = await fs.readFile(output, 'utf-8')
    const { context } = JSON.parse(content)
    t.is(context, 'production')
  } finally {
    await fs.unlink(output)
  }
})

test('Do not write on stdout with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    const { returnValue } = await runFixture(t, 'empty', { flags: { output }, useBinary: true, snapshot: false })
    t.is(returnValue, '')
  } finally {
    await fs.unlink(output)
  }
})

test('Write on stdout with the --output=- flag', async (t) => {
  await runFixture(t, 'empty', { flags: { output: '-' }, useBinary: true })
})

// This test is too slow in local development
if (isCI) {
  test('Handles big outputs', async (t) => {
    const bigNetlify = `${FIXTURES_DIR}/big/netlify.toml`
    await del(bigNetlify, { force: true })
    try {
      const bigContent = getBigNetlifyContent()
      await fs.writeFile(bigNetlify, bigContent)
      const { returnValue } = await runFixture(t, 'big', { snapshot: false, useBinary: true })
      t.notThrows(() => {
        JSON.parse(returnValue)
      })
    } finally {
      await del(bigNetlify, { force: true })
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
