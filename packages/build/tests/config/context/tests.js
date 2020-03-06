const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Context syntax error', async t => {
  await runFixture(t, 'syntax_error')
})
