const { writeFile } = require('fs')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const pWriteFile = promisify(writeFile)

test('--help', async t => {
  await runFixture(t, '', { flags: '--help' })
})

test('--version', async t => {
  await runFixture(t, '', { flags: '--version' })
})

test('Success', async t => {
  await runFixture(t, 'empty')
})

test('User error', async t => {
  await runFixture(t, 'empty', { flags: '--config=/invalid' })
})

test('CLI flags', async t => {
  await runFixture(t, 'empty', { flags: '--branch=test' })
})

test('Stabilitize output with the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: '--stable' })
})

test('Does not stabilitize output without the --stable flag', async t => {
  await runFixture(t, 'empty', { flags: '--no-stable' })
})

test('Handles big outputs', async t => {
  const bigNetlify = `${FIXTURES_DIR}/big/netlify.toml`
  await del(bigNetlify, { force: true })
  try {
    const bigContent = getBigNetlifyContent()
    await pWriteFile(bigNetlify, bigContent)
    const { returnValue } = await runFixture(t, 'big', { snapshot: false })
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
