const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('manifest.yml same directory', async t => {
  await runFixture(t, 'same_directory')
})

test('manifest.yml root directory', async t => {
  await runFixture(t, 'root_directory')
})

test('manifest.yml not root directory', async t => {
  await runFixture(t, 'not_root_directory')
})

test('manifest.yml missing', async t => {
  await runFixture(t, 'missing')
})

test('manifest.yml parse error', async t => {
  await runFixture(t, 'parse_error')
})

test('manifest.yml advanced YAML', async t => {
  await runFixture(t, 'advanced_yaml')
})
