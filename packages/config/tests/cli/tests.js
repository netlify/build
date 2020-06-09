const { writeFile } = require('fs')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const pWriteFile = promisify(writeFile)

test('--help', async t => {
  await runFixture(t, '', { flags: { help: true }, useBinary: true })
})

test('--version', async t => {
  await runFixture(t, '', { flags: { version: true }, useBinary: true })
})

test('Success', async t => {
  await runFixture(t, 'empty', { useBinary: true })
})

test('User error', async t => {
  await runFixture(t, 'empty', { flags: { config: '/invalid' }, useBinary: true })
})

test('CLI flags', async t => {
  await runFixture(t, 'empty', { flags: { branch: 'test' }, useBinary: true })
})

test('Stabilitize output with the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: { stable: true }, useBinary: true })
})

test('Does not stabilitize output without the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: { stable: false }, useBinary: true })
})

test('Handles big outputs', async t => {
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

const getBigNetlifyContent = function() {
  const envVars = Array.from({ length: BIG_NUMBER }, getEnvVar).join('\n')
  return `[build.environment]\n${envVars}`
}

const BIG_NUMBER = 1e4

const getEnvVar = function(value, index) {
  return `TEST${index} = ${index}`
}
