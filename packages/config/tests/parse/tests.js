const { platform, version } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Configuration file - netlify.toml', async t => {
  await runFixture(t, 'toml')
})

// Windows directory permissions work differently than Unix.
// Node 10 also changed errors there, so Node 8 shows different error messages.
if (platform !== 'win32' && !version.startsWith('v8.')) {
  test('Configuration file - read permission error', async t => {
    await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/read_error/netlify.toml` } })
  })
}

test('Configuration file - parsing error', async t => {
  await runFixture(t, 'parse_error')
})
