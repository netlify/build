const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Plugins can execute local binaries', async t => {
  await runFixture(t, 'local_bin')
})

test('Plugin output can interleave stdout and stderr', async t => {
  await runFixture(t, 'interleave')
})

// TODO: check output length once big outputs are actually fixed
test.serial('Big plugin output is not truncated', async t => {
  await runFixture(t, 'big', { snapshot: false })
  t.pass()
})

test('process.env changes are propagated to other plugins', async t => {
  await runFixture(t, 'env_changes_plugin')
})

test('process.env changes are propagated to onError and onEnd', async t => {
  await runFixture(t, 'env_changes_on_error')
})

test('process.env changes are propagated to build.command', async t => {
  await runFixture(t, 'env_changes_command')
})
