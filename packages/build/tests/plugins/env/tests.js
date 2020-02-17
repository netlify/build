const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable lifecycle commands', async t => {
    await runFixture(t, 'lifecycle')
  })
}

test('Environment variable GATSBY_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'gatsby_telemetry')
})

test('Environment variable NEXT_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'next_telemetry')
})

test('Environment variable NETLIFY local', async t => {
  await runFixture(t, 'netlify')
})

test('Environment variable NETLIFY CI', async t => {
  await runFixture(t, 'netlify', { env: { NETLIFY: 'true' } })
})
