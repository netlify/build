const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Remove duplicate plugin options', async t => {
  await runFixture(t, 'options')
})

test('Does not remove duplicate plugin options with different ids', async t => {
  await runFixture(t, 'id')
})

test('Remove duplicate plugin options with different configs but same id', async t => {
  await runFixture(t, 'config')
})
