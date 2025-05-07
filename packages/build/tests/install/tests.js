import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir } from '@netlify/testing'
import test from 'ava'
import { pathExists } from 'path-exists'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

// Run fixture and ensure:
//  - specific directories exist after run
//  - specific directories are removed before/after test
// TODO: once we have a test runner that supports before and after this would be way nicer to read to remove dirs there

const runInstallFixture = async (t, fixtureName, dirs = [], flags = {}, binary = false, useSnapshot = true) => {
  await removeDir(dirs)
  try {
    const fixture = new Fixture(`./fixtures/${fixtureName}`).withFlags(flags)
    const result = binary ? await fixture.runBuildBinary().then(({ output }) => output) : await fixture.runWithBuild()

    if (useSnapshot) {
      t.snapshot(normalizeOutput(result))
    }

    await Promise.all(
      dirs.map(async (dir) => {
        t.true(await pathExists(dir))
      }),
    )

    return { fixture, result }
  } finally {
    await removeDir(dirs)
  }
}

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
    {},
    true,
  )
})

test('Functions: install dependencies with Yarn in CI', async (t) => {
  await runInstallFixture(
    t,
    'functions_yarn_ci',
    [`${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`],
    {
      mode: 'buildbot',
      deployId: 'functions_yarn_ci',
    },
    true,
  )
})

test('Functions: does not install dependencies unless opting in', async (t) => {
  await runInstallFixture(t, 'optional')
  t.false(await pathExists(`${FIXTURES_DIR}/optional/functions/node_modules/`))
})

test('Functions: does not install dependencies unless opting in (with esbuild)', async (t) => {
  await runInstallFixture(t, 'optional-esbuild')
  t.false(await pathExists(`${FIXTURES_DIR}/optional-esbuild/functions/node_modules/`))
})

test('Functions: does not install dependencies unless opting in (with esbuild, many dependencies)', async (t) => {
  await runInstallFixture(t, 'optional-many-esbuild')
  t.false(await pathExists(`${FIXTURES_DIR}/optional-many-esbuild/functions/node_modules/`))
})

test('Functions: does not print warnings when dependency was mispelled', async (t) => {
  await runInstallFixture(t, 'mispelled_dep')
  t.false(await pathExists(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`))
})

test('Functions: does not print warnings when dependency was local', async (t) => {
  await runInstallFixture(t, 'local_dep')
  t.false(await pathExists(`${FIXTURES_DIR}/local_dep/functions/node_modules/`))
})

test('Functions: install dependencies handles errors', async (t) => {
  const { fixture, result } = await runInstallFixture(t, 'functions_error', [], {}, false, false)
  const functionsPath = join(fixture.repositoryRoot, 'functions')

  t.true(result.includes(`Error while installing dependencies in ${functionsPath}`))
})

test('Install local plugin dependencies: with npm', async (t) => {
  await runInstallFixture(t, 'npm', [`${FIXTURES_DIR}/npm/plugin/node_modules/`])
})

test('Install local plugin dependencies: with yarn locally', async (t) => {
  await runInstallFixture(t, 'yarn', [`${FIXTURES_DIR}/yarn/plugin/node_modules/`], {}, true, true)
})

test('Install local plugin dependencies: with yarn in CI', async (t) => {
  await runInstallFixture(
    t,
    'yarn_ci',
    [`${FIXTURES_DIR}/yarn_ci/plugin/node_modules/`],
    { mode: 'buildbot' },
    true,
    true,
  )
})

test('Install local plugin dependencies: propagate errors', async (t) => {
  const fixture = new Fixture('./fixtures/error')
  const { success, output } = await fixture.runWithBuildAndIntrospect()
  const pluginPath = join(fixture.repositoryRoot, 'plugin')

  t.false(success)
  t.true(output.includes(`Error while installing dependencies in ${pluginPath}`))
})

test('Install local plugin dependencies: already installed', async (t) => {
  const output = await new Fixture('./fixtures/already').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Install local plugin dependencies: no package.json', async (t) => {
  const output = await new Fixture('./fixtures/no_package').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Install local plugin dependencies: no root package.json', async (t) => {
  const output = await new Fixture('./fixtures/no_root_package')
    .withCopyRoot()
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('Install local plugin dependencies: missing plugin in netlify.toml', async (t) => {
  const output = await new Fixture('./fixtures/local_missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('In integration dev mode, install local plugins and install the integration when forcing build', async (t) => {
  const output = await new Fixture('./fixtures/local_missing_integration').withFlags({ context: 'dev' }).runWithBuild()

  t.snapshot(normalizeOutput(output))
})
