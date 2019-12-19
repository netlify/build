const { platform } = require('process')

const test = require('ava')
const isCi = require('is-ci')

const { runFixture } = require('../../helpers/main')

test('cache-utils defined', async t => {
  await runFixture(t, 'defined')
})

test('cache-utils save', async t => {
  await runFixture(t, 'save')
})

test('cache-utils no options', async t => {
  await runFixture(t, 'no_options')
})

test('cache-utils remove', async t => {
  await runFixture(t, 'remove')
})

test('cache-utils move', async t => {
  await runFixture(t, 'move')
})

test('cache-utils TTL', async t => {
  await runFixture(t, 'ttl')
})

test('cache-utils TTL invalid', async t => {
  await runFixture(t, 'ttl_invalid')
})

test('cache-utils TTL negative', async t => {
  await runFixture(t, 'ttl_negative')
})

test('cache-utils ci', async t => {
  await runFixture(t, 'save', { env: { DEPLOY_PRIME_URL: 'test', CACHE_BASE: 'test' } })
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

test('cache-utils manifest missing', async t => {
  await runFixture(t, 'manifest_missing')
})

// This does not work on Windows when inside GitHub actions
// TODO: figure out why
if (!isCi || platform !== 'win32') {
  test('cache-utils home directory', async t => {
    await runFixture(t, 'home')
  })
}
