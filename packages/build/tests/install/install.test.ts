import { existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir } from '@netlify/testing'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

// Run fixture and report:
//  - which of the given directories are missing after the run
//  - specific directories are removed before/after test
// TODO: once we have a test runner that supports before and after this would be way nicer to read to remove dirs there

const runInstallFixture = async (
  fixtureName: string,
  dirs: string[] = [],
  flags: Record<string, unknown> = {},
  binary = false,
) => {
  await removeDir(dirs)
  try {
    const fixture = new Fixture(import.meta.url, `./fixtures/${fixtureName}`).withFlags(flags)
    const output = binary ? await fixture.runBuildBinary().then(({ output }) => output) : await fixture.runWithBuild()
    const missingDirs = dirs.filter((dir) => !existsSync(dir))

    return { fixture, output, missingDirs }
  } finally {
    await removeDir(dirs)
  }
}

test('Functions: install dependencies nested', async () => {
  const { output, missingDirs } = await runInstallFixture('dir', [
    `${FIXTURES_DIR}/dir/.netlify/functions/`,
    `${FIXTURES_DIR}/dir/functions/function/node_modules/`,
  ])
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Functions: ignore package.json inside node_modules', async () => {
  const { output, missingDirs } = await runInstallFixture('modules', [`${FIXTURES_DIR}/modules/.netlify/functions/`])
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Functions: install dependencies with npm', async () => {
  const { output, missingDirs } = await runInstallFixture('functions_npm', [
    `${FIXTURES_DIR}/functions_npm/.netlify/functions/`,
    `${FIXTURES_DIR}/functions_npm/functions/node_modules/`,
  ])
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Functions: install dependencies with Yarn locally', async () => {
  const { output, missingDirs } = await runInstallFixture(
    'functions_yarn',
    [`${FIXTURES_DIR}/functions_yarn/.netlify/functions/`, `${FIXTURES_DIR}/functions_yarn/functions/node_modules/`],
    {},
    true,
  )
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Functions: install dependencies with Yarn in CI', async () => {
  const { output, missingDirs } = await runInstallFixture(
    'functions_yarn_ci',
    [`${FIXTURES_DIR}/functions_yarn_ci/functions/node_modules/`],
    {
      mode: 'buildbot',
      deployId: 'functions_yarn_ci',
    },
    true,
  )
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Functions: does not install dependencies unless opting in', async () => {
  const { output } = await runInstallFixture('optional')
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(existsSync(`${FIXTURES_DIR}/optional/functions/node_modules/`)).toBe(false)
})

test('Functions: does not install dependencies unless opting in (with esbuild)', async () => {
  const { output } = await runInstallFixture('optional-esbuild')
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(existsSync(`${FIXTURES_DIR}/optional-esbuild/functions/node_modules/`)).toBe(false)
})

test('Functions: does not install dependencies unless opting in (with esbuild, many dependencies)', async () => {
  const { output } = await runInstallFixture('optional-many-esbuild')
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(existsSync(`${FIXTURES_DIR}/optional-many-esbuild/functions/node_modules/`)).toBe(false)
})

test('Functions: does not print warnings when dependency was mispelled', async () => {
  const { output } = await runInstallFixture('mispelled_dep')
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(existsSync(`${FIXTURES_DIR}/mispelled_dep/functions/node_modules/`)).toBe(false)
})

test('Functions: does not print warnings when dependency was local', async () => {
  const { output } = await runInstallFixture('local_dep')
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(existsSync(`${FIXTURES_DIR}/local_dep/functions/node_modules/`)).toBe(false)
})

test('Functions: install dependencies handles errors', async () => {
  const { fixture, output } = await runInstallFixture('functions_error')
  const functionsPath = join(fixture.repositoryRoot, 'functions')

  expect(output).toContain(`Error while installing dependencies in ${functionsPath}`)
})

test('Install local plugin dependencies: with npm', async () => {
  const { output, missingDirs } = await runInstallFixture('npm', [`${FIXTURES_DIR}/npm/plugin/node_modules/`])
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Install local plugin dependencies: with yarn locally', async () => {
  const { output, missingDirs } = await runInstallFixture(
    'yarn',
    [`${FIXTURES_DIR}/yarn/plugin/node_modules/`],
    {},
    true,
  )
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Install local plugin dependencies: with yarn in CI', async () => {
  const { output, missingDirs } = await runInstallFixture(
    'yarn_ci',
    [`${FIXTURES_DIR}/yarn_ci/plugin/node_modules/`],
    { mode: 'buildbot' },
    true,
  )
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(missingDirs).toEqual([])
})

test('Install local plugin dependencies: propagate errors', async () => {
  const fixture = new Fixture(import.meta.url, './fixtures/error')
  const { success, output } = await fixture.runWithBuildAndIntrospect()
  const pluginPath = join(fixture.repositoryRoot, 'plugin')

  expect(success).toBe(false)
  expect(output).toContain(`Error while installing dependencies in ${pluginPath}`)
})

test('Install local plugin dependencies: already installed', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/already').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Install local plugin dependencies: no package.json', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/no_package').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Install local plugin dependencies: no root package.json', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/no_root_package')
    .withCopyRoot()
    .then((fixture) => fixture.runWithBuild())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Install local plugin dependencies: missing plugin in netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/local_missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('when --context=dev, install local integration from a directory defined via netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/local_missing_integration_directory_path')
    .withFlags({ context: 'dev' })
    .runWithBuild()

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('when --context=dev, install local integration from a tarball defined via netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/local_missing_integration_tarball_path')
    .withFlags({ context: 'dev' })
    .runWithBuild()

  expect(normalizeOutput(output)).toMatchSnapshot()
})
