const test = require('ava')

const { runFixture } = require('../helpers/main')

test('build.command empty', async t => {
  await runFixture(t, 'command_empty')
})

test('Some properties can be capitalized', async t => {
  await runFixture(t, 'props_case')
})
