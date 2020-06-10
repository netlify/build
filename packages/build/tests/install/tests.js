const test = require('ava')
const pathExists = require('path-exists')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

// Run fixture and ensure:
//  - specific directories exist after run
//  - specific directories are removed before/after test
const runInstallFixture = async function(t, fixtureName, dirs, opts) {
  await removeDir(dirs)
  try {
    await runFixture(t, fixtureName, opts)
    await Promise.all(
      dirs.map(async dir => {
        t.true(await pathExists(dir))
      }),
    )
  } finally {
    await removeDir(dirs)
  }
}

test('Functions: install dependencies nested', async t => {
  await runInstallFixture(t, 'dir', [
    `${FIXTURES_DIR}/dir/.netlify/functions/`,
    `${FIXTURES_DIR}/dir/functions/function/node_modules/`,
  ])
})

test('Functions: ignore package.json inside node_modules', async t => {
  await runInstallFixture(t, 'node_modules', [`${FIXTURES_DIR}/node_modules/.netlify/functions/`])
})

test('Functions: install dependencies with npm', async t => {
  await runInstallFixture(t, 'functions_npm', [
    `${FIXTURES_DIR}/functions_npm/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_npm/functions/node_modules/`,
  ])
})

test('Functions: install dependencies with Yarn locally', async t => {
  await runInstallFixture(
    t,
    'functions_yarn',
    [`${FIXTURES_DIR}/functions_yarn/.netlify/functions/`, `${FIXTURES_DIR}/functions_yarn/functions/node_modules/`],
    { useBinary: true },
  )
})

test('Functions: install dependencies with Yarn in CI', async t => {
  await runInstallFixture(t, 'functions_yarn_ci', [`${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`], {
    useBinary: true,
    flags: { mode: 'buildbot', deployId: 'functions_yarn_ci' },
  })
})

test('Functions: does not install dependencies unless opting in', async t => {
  await runInstallFixture(t, 'optional', [`${FIXTURES_DIR}/optional/.netlify/functions/`])
  t.false(await pathExists(`${FIXTURES_DIR}/optional/functions/node_modules/`))
})

test('Functions: does not print warnings when dependency was mispelled', async t => {
  await runInstallFixture(t, 'mispelled_dep', [`${FIXTURES_DIR}/mispelled_dep/.netlify/functions/`])
  t.false(await pathExists(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`))
})

test('Install local plugin dependencies: with npm', async t => {
  await runInstallFixture(t, 'npm', [`${FIXTURES_DIR}/npm/plugin/node_modules/`])
})

test('Install local plugin dependencies: with yarn locally', async t => {
  await runInstallFixture(t, 'yarn', [`${FIXTURES_DIR}/yarn/plugin/node_modules/`], { useBinary: true })
})

test('Install local plugin dependencies: with yarn in CI', async t => {
  await runInstallFixture(t, 'yarn_ci', [`${FIXTURES_DIR}/yarn_ci/plugin/node_modules/`], {
    useBinary: true,
    flags: { mode: 'buildbot' },
  })
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
