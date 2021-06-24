'use strict'

const { writeFile, readFile, unlink } = require('fs')
const { join } = require('path')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')
const isCI = require('is-ci')
const { tmpName: getTmpName } = require('tmp-promise')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)
const pUnlink = promisify(unlink)

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
  await runFixture(t, 'empty', { flags: { config: join(__dirname, 'invalid') }, useBinary: true })
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
    const content = await pReadFile(output)
    const { context } = JSON.parse(content)
    t.is(context, 'production')
  } finally {
    await pUnlink(output)
  }
})

test('Do not write on stdout with the --output flag', async (t) => {
  const output = await getTmpName({ dir: 'netlify-build-test' })
  try {
    const { returnValue } = await runFixture(t, 'empty', { flags: { output }, useBinary: true, snapshot: false })
    t.is(returnValue, '')
  } finally {
    await pUnlink(output)
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
      await pWriteFile(bigNetlify, bigContent)
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
