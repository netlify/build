const { platform, version } = require('process')

const test = require('ava')
const isCi = require('is-ci')

const { runFixture } = require('../../helpers/main')

test('cache-utils defined', async t => {
  await runFixture(t, 'defined')
})

test('cache-utils save', async t => {
  await runFixture(t, 'save')
})

test('cache-utils save array', async t => {
  await runFixture(t, 'save_array')
})

test('cache-utils no options', async t => {
  await runFixture(t, 'no_options')
})

test('cache-utils remove', async t => {
  await runFixture(t, 'remove')
})

test('cache-utils remove array', async t => {
  await runFixture(t, 'remove_array')
})

test('cache-utils move', async t => {
  await runFixture(t, 'move')
})

test('cache-utils list', async t => {
  await runFixture(t, 'list')
})

test('cache-utils TTL invalid', async t => {
  await runFixture(t, 'ttl_invalid')
})

test('cache-utils TTL negative', async t => {
  await runFixture(t, 'ttl_negative')
})

test('cache-utils directory', async t => {
  await runFixture(t, 'directory')
})

test('cache-utils save non existing', async t => {
  await runFixture(t, 'save_non_existing')
})

test('cache-utils file contents is kept', async t => {
  await runFixture(t, 'contents')
})

test('cache-utils restore already existing file', async t => {
  await runFixture(t, 'restore_already')
})

test('cache-utils restore non-cached file', async t => {
  await runFixture(t, 'restore_non_cached')
})

test('cache-utils hash', async t => {
  await runFixture(t, 'hash')
})

test('cache-utils hash directory', async t => {
  await runFixture(t, 'hash_directory')
})

test('cache-utils hash big directory', async t => {
  await runFixture(t, 'hash_big')
})

test('cache-utils digests', async t => {
  await runFixture(t, 'digests')
})

test('cache-utils digests missing', async t => {
  await runFixture(t, 'digests_missing')
})

test('cache-utils digests many', async t => {
  await runFixture(t, 'digests_many')
})

// This does not work on Node 8 when inside GitHub actions
// TODO: figure out why
if (!isCi || !version.startsWith('v8.')) {
  test('cache-utils ci', async t => {
    await runFixture(t, 'save', { env: { NETLIFY: 'true' } })
  })
}

if (!isCi || platform !== 'win32') {
  // This does not work on Windows when inside GitHub actions
  // TODO: figure out why
  test('cache-utils home directory', async t => {
    await runFixture(t, 'home')
  })

  // This relies on timing, which is slow in GitHub actions Windows VM, making
  // the tests randomly fail
  test.skip('cache-utils TTL', async t => {
    await runFixture(t, 'ttl')
  })

  test.skip('cache-utils manifest missing', async t => {
    await runFixture(t, 'manifest_missing')
  })
}
