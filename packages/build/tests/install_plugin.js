const { platform } = require('process')

const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('./helpers/main')

test('Install local plugin dependencies: with npm', async t => {
  await runFixture(t, 'plugin_deps')
  await del(`${FIXTURES_DIR}/plugin_deps/plugin/node_modules`)
})

// This test does not work on Windows when run inside Ava
if (platform !== 'win32') {
  test('Install local plugin dependencies: with yarn', async t => {
    await runFixture(t, 'plugin_deps_yarn')
    await del(`${FIXTURES_DIR}/plugin_deps_yarn/plugin/node_modules`)
  })
}

test('Install local plugin dependencies: propagate errors', async t => {
  await runFixture(t, 'plugin_deps_error')
})

test('Install local plugin dependencies: already installed', async t => {
  await runFixture(t, 'plugin_deps_already')
})

test('Install local plugin dependencies: no package.json', async t => {
  await runFixture(t, 'plugin_deps_no_package')
})
