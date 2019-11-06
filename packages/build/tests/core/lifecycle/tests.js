const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Lifecycle commands can execute local binaries', async t => {
  await runFixture(t, 'local_bin')
})
