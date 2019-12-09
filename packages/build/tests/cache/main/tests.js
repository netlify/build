const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

const HOME_CACHE = `${__dirname}/home_cache`

test('Node modules', async t => {
  await runFixture(t, 'node', { env: { CACHE_BASE: '.', CACHE_PATH: 'node_modules' } })
})

test('Bower components', async t => {
  await runFixture(t, 'bower', { env: { CACHE_BASE: '.', CACHE_PATH: 'bower_components' } })
})

test('Ruby gems', async t => {
  await runFixture(t, 'gems', { env: { CACHE_BASE: '.', CACHE_PATH: '.bundle' } })
})

test('Python virtualenv', async t => {
  await runFixture(t, 'venv', { env: { CACHE_BASE: '.', CACHE_PATH: '.venv' } })
})

test('WAPM packages', async t => {
  await runFixture(t, 'wapm', { env: { CACHE_BASE: '.', CACHE_PATH: 'wapm_packages' } })
})

test.serial('Yarn', async t => {
  await runFixture(t, 'yarn', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.yarn_cache' } })
})

test.serial('Pip', async t => {
  await runFixture(t, 'pip', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.cache/pip' } })
})

test.serial('Emacs cache', async t => {
  await runFixture(t, 'emacs_cache', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.cask' } })
})

test.serial('Emacs', async t => {
  await runFixture(t, 'emacs', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.emacs.d' } })
})

test.serial('Maven', async t => {
  await runFixture(t, 'maven', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.m2' } })
})

test.serial('Boot', async t => {
  await runFixture(t, 'boot', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.boot' } })
})

test.serial('Composer', async t => {
  await runFixture(t, 'composer', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.composer' } })
})

test.serial('Wasmer', async t => {
  await runFixture(t, 'wasmer', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.wasmer/cache' } })
})

test.serial('Go dependencies', async t => {
  await runFixture(t, 'gimme', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.gimme_cache' } })
})

test.serial('nvm', async t => {
  await runFixture(t, 'nvm', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.nvm/versions/node' } })
})

test.serial('rvm', async t => {
  await runFixture(t, 'rvm', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.rvm/rubies' } })
})

// This works on Windows locally but not inside GitHub actions
// TODO: figure out why
if (platform !== 'win32') {
  test('CI', async t => {
    await runFixture(t, 'ci', { env: { CACHE_BASE: '.', CACHE_PATH: 'bower_components', DEPLOY_PRIME_URL: 'test' } })
  })
}
