import { existsSync } from 'fs'
import { readdir, rm, stat, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir, getTempName, unzipFile } from '@netlify/testing'
import type { FunctionResult, Manifest } from '@netlify/zip-it-and-ship-it'
import semver from 'semver'
import { assert, expect, test } from 'vitest'

import { trackBundleResults } from '../../lib/log/messages/core_steps.js'
import { importJsonFile } from '../../lib/utils/json.js'
import { pathExists } from '../../lib/utils/path_exists.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

interface FunctionMetadata {
  bootstrap_version: string
  branch: string
  version: number
}

test('Functions: missing source directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: must not be a regular file', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/regular_file').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: can be a symbolic link', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/symlink').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: default directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: simple setup', async () => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  const output = await new Fixture(import.meta.url, './fixtures/simple').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: no functions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: invalid package.json', async () => {
  const packageJsonPath = `${FIXTURES_DIR}/functions_package_json_invalid/package.json`
  // We need to create that file during tests. Otherwise, ESLint fails when
  // detecting an invalid *.json file.
  await writeFile(packageJsonPath, '{{}')
  try {
    const output = await new Fixture(import.meta.url, './fixtures/functions_package_json_invalid').runWithBuild()
    // This shape of this error can change with different Node.js versions.
    expect(output).toContain('in JSON at position 1')
  } finally {
    await rm(packageJsonPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Functions: --functionsDistDir', async () => {
  const functionsDistDir = getTempName()
  try {
    const output = await new Fixture(import.meta.url, './fixtures/simple')
      .withFlags({ mode: 'buildbot', functionsDistDir })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    expect(existsSync(functionsDistDir)).toBe(true)
    const files = await readdir(functionsDistDir)
    // We're expecting two files: the function ZIP and the manifest.
    expect(files).toHaveLength(2)
  } finally {
    await removeDir(functionsDistDir)
  }
})

test('Functions: custom path on scheduled function', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/custom_path_scheduled').runWithBuild()
  expect(output).toContain('Scheduled functions must not specify a custom path.')
})

test('Functions: custom path on event-triggered function', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/custom_path_event_triggered').runWithBuild()
  expect(output).toContain('Event-triggered functions must not specify a custom path.')
})

test('Functions: internal functions are cleared on the dev timeline', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/functions_leftover')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  // Before starting Netlify Build, the leftover files should exist and the
  // generated files should not.
  await stat(`${fixture.repositoryRoot}/.netlify/functions-internal/leftover.mjs`)
  await stat(`${fixture.repositoryRoot}/.netlify/edge-functions/leftover.mjs`)
  await expect(stat(`${fixture.repositoryRoot}/.netlify/functions-internal/from-plugin.mjs`)).rejects.toMatchObject({
    code: 'ENOENT',
  })
  await expect(stat(`${fixture.repositoryRoot}/.netlify/edge-functions/from-plugin.mjs`)).rejects.toMatchObject({
    code: 'ENOENT',
  })

  await fixture.runDev(() => {})

  // After running Netlify Build, the leftover files should have been removed
  // but the generated files should have been preserved.
  await expect(stat(`${fixture.repositoryRoot}/.netlify/functions-internal/leftover.mjs`)).rejects.toMatchObject({
    code: 'ENOENT',
  })
  await expect(stat(`${fixture.repositoryRoot}/.netlify/edge-functions/leftover.mjs`)).rejects.toMatchObject({
    code: 'ENOENT',
  })
  await stat(`${fixture.repositoryRoot}/.netlify/functions-internal/from-plugin.mjs`)
  await stat(`${fixture.repositoryRoot}/.netlify/edge-functions/from-plugin.mjs`)
})

test('Functions: cleanup is only triggered when there are internal functions', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/internal_functions')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  await rm(`${fixture.repositoryRoot}/.netlify/functions-internal/`, { force: true, recursive: true })
  await rm(`${fixture.repositoryRoot}/.netlify/edge-functions/`, { force: true, recursive: true })

  const output = await fixture.runDev(() => {})
  expect(output).not.toContain('Cleaning up leftover files from previous builds')
})

test('Functions: bundles a Netlify Server entry when the feature flag is on', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/server_entry')
    .withFlags({ debug: false, featureFlags: { netlify_build_server_entry: true } })
    .withCopyRoot()

  const output = await fixture.runWithBuild()

  expect(output).toContain('Netlify Server detected at netlify/server/index.mjs')

  const functionsDist = await readdir(resolve(fixture.repositoryRoot, '.netlify/functions'))

  expect(functionsDist).toContain('manifest.json')
  expect(functionsDist).toContain('___netlify-server.zip')

  const { functions } = await importJsonFile<Manifest>(
    resolve(fixture.repositoryRoot, '.netlify/functions/manifest.json'),
  )
  const serverEntry = functions.find(({ name }) => name === '___netlify-server')

  assert.isDefined(serverEntry)
  expect(serverEntry.displayName).toBe('Netlify Server')
  expect(serverEntry.generator).toBe('netlify-server')
  expect(serverEntry.routes).toHaveLength(1)
  expect(serverEntry.routes?.[0].pattern).toBe('/*')
  expect(serverEntry.routes?.[0].prefer_static).toBe(true)
})

test('Functions: ignores a Netlify Server entry when the feature flag is off', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/server_entry')
    .withFlags({ debug: false })
    .withCopyRoot()

  const output = await fixture.runWithBuild()

  expect(output).not.toContain('Netlify Server detected')
  expect(await pathExists(resolve(fixture.repositoryRoot, '.netlify/functions/___netlify-server.zip'))).toBe(false)
})

test('Functions: fails the build on multiple Netlify Server entrypoints', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/server_entry_multiple')
    .withFlags({ debug: false, featureFlags: { netlify_build_server_entry: true } })
    .withCopyRoot()

  const output = await fixture.runWithBuild()

  expect(output).toContain('Found multiple server entrypoints')
})

test('Functions: loads functions generated with the Frameworks API', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/functions_user_and_frameworks')
    .withFlags({ debug: false })
    .withCopyRoot()

  const output = await fixture.runWithBuild()
  const functionsDist = await readdir(resolve(fixture.repositoryRoot, '.netlify/functions'))

  expect(functionsDist).toContain('manifest.json')
  expect(functionsDist).toContain('server.zip')
  expect(functionsDist).toContain('user.zip')

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: loads functions from the `.netlify/functions-internal` directory and the Frameworks API', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/functions_user_internal_and_frameworks')
    .withFlags({ debug: false })
    .withCopyRoot()

  const output = await fixture.runWithBuild()
  const functionsDist = await readdir(resolve(fixture.repositoryRoot, '.netlify/functions'))

  expect(functionsDist).toContain('manifest.json')
  expect(functionsDist).toContain('server.zip')
  expect(functionsDist).toContain('user.zip')
  expect(functionsDist).toContain('server-internal.zip')

  const { functions } = await importJsonFile<Manifest>(
    resolve(fixture.repositoryRoot, '.netlify/functions/manifest.json'),
  )

  expect(functions).toHaveLength(5)

  // The Frameworks API takes precedence over the legacy internal directory.
  const frameworksInternalConflict = functions.find(({ name }) => name === 'frameworks-internal-conflict')
  expect(frameworksInternalConflict?.routes?.[0].pattern).toBe('/frameworks-internal-conflict/frameworks')

  // User code takes precedence over the Frameworks API.
  const frameworksUserConflict = functions.find(({ name }) => name === 'frameworks-user-conflict')
  expect(frameworksUserConflict?.routes?.[0].pattern).toBe('/frameworks-user-conflict/user')

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Functions: loads functions generated with the Frameworks API in a monorepo setup', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/functions_monorepo').withCopyRoot({ git: false })
  const app1 = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runWithBuildAndIntrospect()

  expect(app1.success).toBe(true)

  const app2 = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runWithBuildAndIntrospect()

  expect(app2.success).toBe(true)

  const app1FunctionsDist = await readdir(resolve(fixture.repositoryRoot, 'apps/app-1/.netlify/functions'))
  expect(app1FunctionsDist).toHaveLength(2)
  expect(app1FunctionsDist).toContain('manifest.json')
  expect(app1FunctionsDist).toContain('server.zip')

  const app2FunctionsDist = await readdir(resolve(fixture.repositoryRoot, 'apps/app-2/.netlify/functions'))
  expect(app2FunctionsDist).toHaveLength(3)
  expect(app2FunctionsDist).toContain('manifest.json')
  expect(app2FunctionsDist).toContain('server.zip')
  expect(app2FunctionsDist).toContain('worker.zip')
})

const fakeResult = (overrides: Partial<FunctionResult> = {}): FunctionResult => ({
  name: 'fn',
  runtime: 'js',
  bundler: 'zisi',
  config: {},
  entryFilename: 'fn.js',
  mainFile: 'fn.js',
  path: 'fn.zip',
  ...overrides,
})

test('trackBundleResults: writes the rich summary to the system log', () => {
  const messages: unknown[][] = []
  trackBundleResults({
    systemLog: (...args) => messages.push(args),
    results: [fakeResult({ name: 'a', bundler: 'zisi', bundlerErrors: [{}] })],
  })
  expect(messages).toEqual([
    [
      {
        msg: 'Functions bundling completed successfully',
        bundlers: ['zisi'],
        bundlerCounts: { zisi: 1 },
        fallbackCount: 1,
        warningsCount: 0,
        functions: [
          {
            name: 'a',
            runtime: 'js',
            bundler: 'zisi',
            bundlerReason: null,
            sizeBytes: null,
            hadFallback: true,
            hadWarnings: false,
          },
        ],
      },
    ],
  ])
})

test('trackBundleResults: returns summary stats for metric tags', () => {
  const summary = trackBundleResults({
    systemLog: () => {},
    results: [
      fakeResult({ name: 'a', bundler: 'esbuild' }),
      fakeResult({ name: 'b', bundler: 'zisi', bundlerErrors: [{}] }),
    ],
  })
  expect(summary).toEqual({ bundlers: ['esbuild', 'zisi'], fallbackCount: 1, warningsCount: 0 })
})

test('trackBundleResults: records per-function bundler reason and sizes', () => {
  const messages: unknown[][] = []
  trackBundleResults({
    systemLog: (...args) => messages.push(args),
    results: [
      fakeResult({ name: 'a', bundler: 'nft', bundlerReason: 'flag-forced-nft', size: 100 }),
      fakeResult({ name: 'b', bundler: 'zisi', bundlerReason: 'zisi-default', size: 200 }),
      fakeResult({ name: 'c', bundler: 'nft', bundlerReason: 'esm-default', size: 300 }),
    ],
  })

  expect(messages[0][0]).toMatchObject({
    functions: [
      { name: 'a', bundlerReason: 'flag-forced-nft', sizeBytes: 100 },
      { name: 'b', bundlerReason: 'zisi-default', sizeBytes: 200 },
      { name: 'c', bundlerReason: 'esm-default', sizeBytes: 300 },
    ],
  })
})

// Prebuilt `.zip` JS functions pass through zip-it-and-ship-it with no
// `bundler` field. They should not pollute `bundlers` with `undefined`.
test('trackBundleResults: excludes JS results that have no bundler (prebuilt .zip)', () => {
  const summary = trackBundleResults({
    systemLog: () => {},
    results: [
      fakeResult({ name: 'a', bundler: 'esbuild' }),
      fakeResult({ name: 'b', bundler: undefined }), // prebuilt .zip
    ],
  })
  expect(summary.bundlers).toEqual(['esbuild'])
})

test('Functions: creates metadata file', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/v2').withCopyRoot({ git: false })
  const build = await fixture
    .withFlags({
      branch: 'my-branch',
      cwd: fixture.repositoryRoot,
    })
    .runWithBuildAndIntrospect()

  expect(build.success).toBe(true)

  const functionsDistPath = resolve(fixture.repositoryRoot, '.netlify/functions')
  const functionsDistFiles = await readdir(functionsDistPath)

  expect(functionsDistFiles).toContain('manifest.json')
  expect(functionsDistFiles).toContain('test.zip')

  const unzipPath = join(functionsDistPath, `.netlify-test-${String(Date.now())}`)

  await unzipFile(join(functionsDistPath, 'test.zip'), unzipPath)

  const functionFiles = await readdir(unzipPath)

  expect(functionFiles).toContain('___netlify-bootstrap.mjs')
  expect(functionFiles).toContain('___netlify-entry-point.mjs')
  expect(functionFiles).toContain('___netlify-metadata.json')
  expect(functionFiles).toContain('test.mjs')

  const metadata = await importJsonFile<FunctionMetadata>(join(unzipPath, '___netlify-metadata.json'))

  expect(semver.valid(metadata.bootstrap_version)).toBe(metadata.bootstrap_version)
  expect(metadata.branch).toBe('my-branch')
  expect(metadata.version).toBe(1)
})
