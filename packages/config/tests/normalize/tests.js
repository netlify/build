const test = require('ava')

const { runFixture } = require('../helpers/main')

test('build.command empty', async t => {
  await runFixture(t, 'command_empty')
})
