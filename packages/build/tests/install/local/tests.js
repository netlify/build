const test = require('ava')
const pathExists = require('path-exists')

const { removeDir } = require('../../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Install local plugin dependencies: with npm', async t => {
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
  await runFixture(t, 'npm')
  t.true(await pathExists(`${FIXTURES_DIR}/npm/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
})

test('Install local plugin dependencies: with yarn locally', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
  await runFixture(t, 'yarn')
  t.true(await pathExists(`${FIXTURES_DIR}/yarn/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
})

test('Install local plugin dependencies: with yarn in CI', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_ci/plugin/node_modules`)
  await runFixture(t, 'yarn_ci', { flags: { mode: 'buildbot' } })
  t.true(await pathExists(`${FIXTURES_DIR}/yarn_ci/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn_ci/plugin/node_modules`)
})

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
  await runFixture(t, 'no_root_package', { copyRoot: {} })
})

test('Install local plugin dependencies: missing plugin in netlify.toml', async t => {
  await runFixture(t, 'missing')
})
