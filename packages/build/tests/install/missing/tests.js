const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Automatically install missing plugins locally', async t => {
  await runFixture(t, 'main', { copyRoot: {} })
})

test('Automatically install missing plugins in CI', async t => {
  await runFixture(t, 'main', { copyRoot: {}, flags: { mode: 'buildbot' } })
})

test('Re-use previously automatically installed plugins', async t => {
  await runFixture(t, 'already_installed', { snapshot: false })
  await runFixture(t, 'already_installed')
})
