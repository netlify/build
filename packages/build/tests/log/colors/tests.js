const test = require('ava')
const { red } = require('chalk')
const hasAnsi = require('has-ansi')

const { runFixture } = require('../../helpers/main')

test('Colors in parent process', async t => {
  const { returnValue } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: '--dry',
    env: { FORCE_COLOR: '1' },
  })
  t.true(hasAnsi(returnValue))
})

test('Colors in child process', async t => {
  const { returnValue } = await runFixture(t, 'child', { snapshot: false, normalize: false, env: { FORCE_COLOR: '1' } })
  t.true(returnValue.includes(red('onPreBuild')))
})

test('Netlify CI', async t => {
  const { returnValue } = await runFixture(t, 'parent', {
    snapshot: false,
    normalize: false,
    flags: '--dry',
    env: { NETLIFY: 'true' },
  })
  t.true(hasAnsi(returnValue))
})

test('No TTY', async t => {
  const { returnValue } = await runFixture(t, 'parent', { snapshot: false, normalize: false, flags: '--dry' })
  t.false(hasAnsi(returnValue))
})
