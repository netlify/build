const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('manifest.yml plain object', async t => {
  await runFixture(t, 'plain_object')
})

test('manifest.yml unknown properties', async t => {
  await runFixture(t, 'unknown')
})

test('manifest.yml name undefined', async t => {
  await runFixture(t, 'name_undefined')
})

test('manifest.yml name is a string', async t => {
  await runFixture(t, 'name_string')
})

test('manifest.yml inputs array', async t => {
  await runFixture(t, 'inputs_array')
})

test('manifest.yml inputs array of objects', async t => {
  await runFixture(t, 'inputs_array_objects')
})

test('manifest.yml inputs unknown property', async t => {
  await runFixture(t, 'inputs_unknown')
})

test('manifest.yml inputs name is undefined', async t => {
  await runFixture(t, 'inputs_name_undefined')
})

test('manifest.yml inputs name is string', async t => {
  await runFixture(t, 'inputs_name_string')
})

test('manifest.yml inputs description is a string', async t => {
  await runFixture(t, 'inputs_description_string')
})

test('manifest.yml inputs required is a boolean', async t => {
  await runFixture(t, 'inputs_required_boolean')
})

test('manifest.yml node module', async t => {
  await runFixture(t, 'module')
})
