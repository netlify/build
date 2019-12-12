const test = require('ava')
const hasAnsi = require('has-ansi')
const { red } = require('chalk')

const { runFixture } = require('../../helpers/main')

test('Colors in parent process', async t => {
  const { all } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: '--dry',
    env: { FORCE_COLOR: '1' },
  })
  t.true(hasAnsi(all))
})

test('Colors in child process', async t => {
  const { all } = await runFixture(t, 'child', { snapshot: false, normalize: false, env: { FORCE_COLOR: '1' } })
  t.true(all.includes(red('onInit')))
})

test('Netlify CI', async t => {
  const { all } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: '--dry',
    env: { DEPLOY_PRIME_URL: 'test' },
  })
  t.true(hasAnsi(all))
})

test('No TTY', async t => {
  const { all } = await runFixture(t, 'parent', { snapshot: false, normalize: false, flags: '--dry' })
  t.false(hasAnsi(all))
})
