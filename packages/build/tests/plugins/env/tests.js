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

test('Environment variable LANG', async t => {
  await runFixture(t, 'lang')
})

test('Environment variable LANGUAGE', async t => {
  await runFixture(t, 'language')
})

test('Environment variable LC_ALL', async t => {
  await runFixture(t, 'lc_all')
})

test('Environment variable CONTEXT', async t => {
  await runFixture(t, 'context')
})
