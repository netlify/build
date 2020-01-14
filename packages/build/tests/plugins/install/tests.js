const { platform } = require('process')
const { tmpdir } = require('os')

const test = require('ava')
const cpy = require('cpy')

const { runFixture, FIXTURES_DIR, removeDir } = require('../../helpers/main')

test('Install local plugin dependencies: with npm', async t => {
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
  await runFixture(t, 'npm')
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
})

// This test randomly fails (https://github.com/netlify/build/issues/657)
// so we do not snapshot it
// It does not work on Windows when run with Ava
if (platform !== 'win32') {
  test('Install local plugin dependencies: with yarn', async t => {
    await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
    await runFixture(t, 'yarn')
    await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
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

test('Install local plugin dependencies: no root package.json', async t => {
  const tmpDir = `${tmpdir()}/build-test-${Math.random()}`
  await cpy('**', tmpDir, { cwd: `${FIXTURES_DIR}/no_root_package`, parents: true })

  await runFixture(t, 'no_root_package', { config: `${tmpDir}/netlify.yml` })
  await removeDir(tmpDir, { force: true })
})
