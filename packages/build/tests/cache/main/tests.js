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

test('Yarn', async t => {
  await runFixture(t, 'yarn', { env: { CACHE_BASE: HOME_CACHE, CACHE_PATH: '.yarn_cache' } })
})
