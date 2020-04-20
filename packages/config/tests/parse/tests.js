const { readFile } = require('fs')
const { platform, version } = require('process')
const { promisify } = require('util')

const test = require('ava')
const del = require('del')
const pathExists = require('path-exists')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const pReadFile = promisify(readFile)

// Test that we create a netlify.toml when using a netlify.yml|yaml|json locally
const getNetlifyTomlPath = async function(fixture) {
  const netlifyTomlPath = `${FIXTURES_DIR}/${fixture}/netlify.toml`

  if (await pathExists(netlifyTomlPath)) {
    await del(netlifyTomlPath, { force: true })
  }

  return netlifyTomlPath
}

const checkNetlifyToml = async function(t, netlifyTomlPath) {
  t.true(await pathExists(netlifyTomlPath))
  const netlifyTomlContent = await pReadFile(netlifyTomlPath, 'utf8')
  t.true(netlifyTomlContent.includes('[build]'))
  await del(netlifyTomlPath, { force: true })
}

test('Configuration file - netlify.yaml', async t => {
  const netlifyTomlPath = await getNetlifyTomlPath('yaml')
  await runFixture(t, 'yaml')
  await checkNetlifyToml(t, netlifyTomlPath)
})

test('Configuration file - netlify.yml', async t => {
  const netlifyTomlPath = await getNetlifyTomlPath('yml')
  await runFixture(t, 'yml')
  await checkNetlifyToml(t, netlifyTomlPath)
})

test('Configuration file - netlify.json', async t => {
  const netlifyTomlPath = await getNetlifyTomlPath('json')
  await runFixture(t, 'json')
  await checkNetlifyToml(t, netlifyTomlPath)
})

test('Configuration file - netlify.toml', async t => {
  await runFixture(t, 'toml')
})

test('Configuration file - invalid format', async t => {
  await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/invalid/netlify.invalid` })
})

test('Configuration file - advanced YAML', async t => {
  await runFixture(t, 'advanced_yaml')
})

// Windows directory permissions work differently than Unix.
// Node 10 also changed errors there, so Node 8 shows different error messages.
if (platform !== 'win32' && !version.startsWith('v8.')) {
  test('Configuration file - read permission error', async t => {
    await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/read_error/netlify.toml` })
  })
}

test('Configuration file - parsing error', async t => {
  await runFixture(t, 'parse_error')
})
