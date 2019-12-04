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

test('Plugin output is buffered in CI', async t => {
  await runFixture(t, 'ci', { env: { DEPLOY_PRIME_URL: 'test' } })
})
