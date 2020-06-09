const test = require('ava')
const pathExists = require('path-exists')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Functions: install dependencies nested', async t => {
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
  await runFixture(t, 'dir')
  t.true(await pathExists(`${FIXTURES_DIR}/dir/functions/function/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/dir/.netlify/functions/`, `${FIXTURES_DIR}/dir/functions/function/node_modules/`])
})

test('Functions: ignore package.json inside node_modules', async t => {
  await removeDir(`${FIXTURES_DIR}/node_modules/.netlify/functions/`)
  await runFixture(t, 'node_modules')
})

test('Functions: install dependencies with npm', async t => {
  await removeDir([
    `${FIXTURES_DIR}/functions_npm/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_npm/functions/node_modules/`,
  ])
  await runFixture(t, 'functions_npm')
  t.true(await pathExists(`${FIXTURES_DIR}/functions_npm/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/functions_npm/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_npm/functions/node_modules/`,
  ])
})

test('Functions: install dependencies with Yarn locally', async t => {
  await removeDir([
    `${FIXTURES_DIR}/functions_yarn/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_yarn/functions/node_modules/`,
  ])
  await runFixture(t, 'functions_yarn', { useBinary: true })
  t.true(await pathExists(`${FIXTURES_DIR}/functions_yarn/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/functions_yarn/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_yarn/functions/node_modules/`,
  ])
})

test('Functions: install dependencies with Yarn in CI', async t => {
  await removeDir([
    `${FIXTURES_DIR}/functions_yarn_ci/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`,
  ])
  await runFixture(t, 'functions_yarn_ci', { useBinary: true, flags: { mode: 'buildbot' } })
  t.true(await pathExists(`${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/functions_yarn_ci/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`,
  ])
})

test('Functions: does not install dependencies unless opting in', async t => {
  await removeDir([`${FIXTURES_DIR}/optional/.netlify/functions/`, `${FIXTURES_DIR}/optional/functions/node_modules/`])
  await runFixture(t, 'optional')
  t.false(await pathExists(`${FIXTURES_DIR}/optional/functions/node_modules/`))
  await removeDir([`${FIXTURES_DIR}/optional/.netlify/functions/`, `${FIXTURES_DIR}/optional/functions/node_modules/`])
})

test('Functions: does not print warnings when dependency was mispelled', async t => {
  await removeDir([
    `${FIXTURES_DIR}/mispelled_dep/.netlify/functions/`,
    `${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`,
  ])
  await runFixture(t, 'mispelled_dep')
  t.false(await pathExists(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`))
  await removeDir([
    `${FIXTURES_DIR}/mispelled_dep/.netlify/functions/`,
    `${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`,
  ])
})

test('Install local plugin dependencies: with npm', async t => {
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
  await runFixture(t, 'npm')
  t.true(await pathExists(`${FIXTURES_DIR}/npm/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/npm/plugin/node_modules`)
})

test('Install local plugin dependencies: with yarn locally', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
  await runFixture(t, 'yarn', { useBinary: true })
  t.true(await pathExists(`${FIXTURES_DIR}/yarn/plugin/node_modules`))
  await removeDir(`${FIXTURES_DIR}/yarn/plugin/node_modules`)
})

test('Install local plugin dependencies: with yarn in CI', async t => {
  await removeDir(`${FIXTURES_DIR}/yarn_ci/plugin/node_modules`)
  await runFixture(t, 'yarn_ci', { useBinary: true, flags: { mode: 'buildbot' } })
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
  await runFixture(t, 'local_missing')
})

test('Automatically install missing plugins locally', async t => {
  await runFixture(t, 'missing', { copyRoot: {} })
})

test('Automatically install missing plugins in CI', async t => {
  await runFixture(t, 'missing', { copyRoot: {}, flags: { mode: 'buildbot' } })
})

test('Re-use previously automatically installed plugins', async t => {
  await runFixture(t, 'already_installed', { snapshot: false })
  await runFixture(t, 'already_installed')
})
