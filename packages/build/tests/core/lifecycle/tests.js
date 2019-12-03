const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Lifecycle commands can execute global binaries', async t => {
  await runFixture(t, 'global_bin')
})

test('Lifecycle commands can execute local binaries', async t => {
  await runFixture(t, 'local_bin')
})

test('Lifecycle commands can execute shell commands', async t => {
  await runFixture(t, 'shell')
})

test('Lifecycle commands use correct PWD', async t => {
  await runFixture(t, 'pwd')
})
