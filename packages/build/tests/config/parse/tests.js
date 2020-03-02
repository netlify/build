const { platform, version } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Configuration file - netlify.yaml', async t => {
  await runFixture(t, 'yaml', { config: false, cwd: `${FIXTURES_DIR}/yaml` })
})

test('Configuration file - netlify.yml', async t => {
  await runFixture(t, 'yml', { config: false, cwd: `${FIXTURES_DIR}/yml` })
})

test('Configuration file - netlify.json', async t => {
  await runFixture(t, 'json', { config: false, cwd: `${FIXTURES_DIR}/json` })
})

test('Configuration file - netlify.toml', async t => {
  await runFixture(t, 'toml', { config: false, cwd: `${FIXTURES_DIR}/toml` })
})

test('Configuration file - invalid format', async t => {
  await runFixture(t, 'invalid_format', { config: `${FIXTURES_DIR}/invalid/netlify.invalid` })
})

test('Configuration file - advanced YAML', async t => {
  await runFixture(t, 'advanced_yaml')
})

// Windows directory permissions work differently than Unix.
// Node 10 also changed errors there, so Node 8 shows different error messages.
if (platform !== 'win32' && !version.startsWith('v8.')) {
  test('Configuration file - read permission error', async t => {
    await runFixture(t, 'read_error')
  })
}

test('Configuration file - parsing error', async t => {
  await runFixture(t, 'parse_error')
})
