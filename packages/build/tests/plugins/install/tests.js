const { platform } = require('process')

const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Install local plugin dependencies: with npm', async t => {
  await runFixture(t, 'npm')
  await del(`${FIXTURES_DIR}/npm/plugin/node_modules`)
})

// This test does not work on Windows when run inside Ava
if (platform !== 'win32') {
  test('Install local plugin dependencies: with yarn', async t => {
    await runFixture(t, 'yarn')
    await del(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
  })
}

test('Install local plugin dependencies: propagate errors', async t => {
  await runFixture(t, 'error')
})

test('Install local plugin dependencies: already installed', async t => {
  await runFixture(t, 'already')
})

test('Install local plugin dependencies: no package.json', async t => {
  await runFixture(t, 'no_package')
})
