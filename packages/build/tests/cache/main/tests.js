const test = require('ava')

const { runFixture } = require('../../helpers/main')

test.serial('Node modules', async t => {
  await runFixture(t, 'simple', { env: { CACHE_BASE: '.', CACHE_PATH: 'node_modules' } })
})

test.serial('Bower components', async t => {
  await runFixture(t, 'simple', { env: { CACHE_BASE: '.', CACHE_PATH: 'bower_components' } })
})

test.serial('Ruby gems', async t => {
  await runFixture(t, 'simple', { env: { CACHE_BASE: '.', CACHE_PATH: '.bundle' } })
})

test.serial('Python virtualenv', async t => {
  await runFixture(t, 'simple', { env: { CACHE_BASE: '.', CACHE_PATH: '.venv' } })
})

test.serial('WAPM packages', async t => {
  await runFixture(t, 'simple', { env: { CACHE_BASE: '.', CACHE_PATH: 'wapm_packages' } })
})
