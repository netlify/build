const { platform, version } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

// Test that we create a netlify.toml when using a netlify.yml|yaml|json locally
test('Configuration file - netlify.yaml', async t => {
  await runFixture(t, 'yaml')
})

test('Configuration file - netlify.yml', async t => {
  await runFixture(t, 'yml')
})

test('Configuration file - netlify.json', async t => {
  await runFixture(t, 'json')
})

test('Configuration file - netlify.toml', async t => {
  await runFixture(t, 'toml')
})

test('Configuration file - invalid format', async t => {
  await runFixture(t, '', { flags: `--config=${FIXTURES_DIR}/invalid/netlify.invalid` })
})

test('Configuration file - netlify.yml that cannot be converted to TOML', async t => {
  await runFixture(t, 'non_convertible_yaml')
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
