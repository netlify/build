'use strict'

const { version } = require('process')

const test = require('ava')
const pathExists = require('path-exists')
const { gte: gteVersion } = require('semver')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

// Run fixture and ensure:
//  - specific directories exist after run
//  - specific directories are removed before/after test
const runInstallFixture = async function (t, fixtureName, dirs, opts) {
  await removeDir(dirs)
  try {
    await runFixture(t, fixtureName, opts)
    await Promise.all(
      dirs.map(async (dir) => {
        t.true(await pathExists(dir))
      }),
    )
  } finally {
    await removeDir(dirs)
  }
}

// @netlify/zip-it-and-ship-it does not support Node 8 during bundling
// TODO: remove once we drop support for Node 8
if (!version.startsWith('v8.')) {
  test('Functions: install dependencies nested', async (t) => {
    await runInstallFixture(t, 'dir', [
      `${FIXTURES_DIR}/dir/.netlify/functions/`,
      `${FIXTURES_DIR}/dir/functions/function/node_modules/`,
    ])
  })

  test('Functions: ignore package.json inside node_modules', async (t) => {
    await runInstallFixture(t, 'modules', [`${FIXTURES_DIR}/modules/.netlify/functions/`])
  })

  test('Functions: install dependencies with npm', async (t) => {
    await runInstallFixture(t, 'functions_npm', [
      `${FIXTURES_DIR}/functions_npm/.netlify/functions/`,
      `${FIXTURES_DIR}/functions_npm/functions/node_modules/`,
    ])
  })

  test('Functions: install dependencies with Yarn locally', async (t) => {
    await runInstallFixture(
      t,
      'functions_yarn',
      [`${FIXTURES_DIR}/functions_yarn/.netlify/functions/`, `${FIXTURES_DIR}/functions_yarn/functions/node_modules/`],
      { useBinary: true },
    )
  })

  test('Functions: install dependencies with Yarn in CI', async (t) => {
    await runInstallFixture(t, 'functions_yarn_ci', [`${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`], {
      useBinary: true,
      flags: { mode: 'buildbot', deployId: 'functions_yarn_ci' },
    })
  })
}

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('Functions: does not install dependencies unless opting in', async (t) => {
    await runInstallFixture(t, 'optional', [])
    t.false(await pathExists(`${FIXTURES_DIR}/optional/functions/node_modules/`))
  })

  test('Functions: does not install dependencies unless opting in (with esbuild)', async (t) => {
    await runInstallFixture(t, 'optional-esbuild', [])
    t.false(await pathExists(`${FIXTURES_DIR}/optional-esbuild/functions/node_modules/`))
  })

  test('Functions: does not install dependencies unless opting in (with esbuild, many dependencies)', async (t) => {
    await runInstallFixture(t, 'optional-many-esbuild', [])
    t.false(await pathExists(`${FIXTURES_DIR}/optional-many-esbuild/functions/node_modules/`))
  })

  test('Functions: does not print warnings when dependency was mispelled', async (t) => {
    await runInstallFixture(t, 'mispelled_dep', [])
    t.false(await pathExists(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`))
  })

  test('Functions: does not print warnings when dependency was local', async (t) => {
    await runInstallFixture(t, 'local_dep', [])
    t.false(await pathExists(`${FIXTURES_DIR}/local_dep/functions/node_modules/`))
  })
}

test('Functions: install dependencies handles errors', async (t) => {
  await runInstallFixture(t, 'functions_error', [])
})

test('Install local plugin dependencies: with npm', async (t) => {
  await runInstallFixture(t, 'npm', [`${FIXTURES_DIR}/npm/plugin/node_modules/`])
})

// @todo: enable those tests for Node <14.0.0
if (gteVersion(version, '14.0.0')) {
  test.skip('Install local plugin dependencies: with yarn locally', async (t) => {
    await runInstallFixture(t, 'yarn', [`${FIXTURES_DIR}/yarn/plugin/node_modules/`], { useBinary: true })
  })

  test.skip('Install local plugin dependencies: with yarn in CI', async (t) => {
    await runInstallFixture(t, 'yarn_ci', [`${FIXTURES_DIR}/yarn_ci/plugin/node_modules/`], {
      useBinary: true,
      flags: { mode: 'buildbot' },
    })
  })
}

test('Install local plugin dependencies: propagate errors', async (t) => {
  await runFixture(t, 'error')
})

test('Install local plugin dependencies: already installed', async (t) => {
  await runFixture(t, 'already')
})

test('Install local plugin dependencies: no package.json', async (t) => {
  await runFixture(t, 'no_package')
})

test('Install local plugin dependencies: no root package.json', async (t) => {
  await runFixture(t, 'no_root_package', { copyRoot: {} })
})

test('Install local plugin dependencies: missing plugin in netlify.toml', async (t) => {
  await runFixture(t, 'local_missing')
})
