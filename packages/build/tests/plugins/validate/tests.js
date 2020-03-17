const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Validate plugin is an object', async t => {
  await runFixture(t, 'object')
})

test('Validate plugin event handler names', async t => {
  await runFixture(t, 'handler_name')
})

test('Validate plugin event handler function', async t => {
  await runFixture(t, 'handler_function')
})

test('Validate plugin backward compatibility from manifest.yml', async t => {
  await runFixture(t, 'backward_compat')
})
