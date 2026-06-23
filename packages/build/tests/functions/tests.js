import { readdir, readFile, rm, stat, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { version as nodeVersion } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput, removeDir, getTempName, unzipFile } from '@netlify/testing'
import { ROOT_CONTEXT, context, trace } from '@opentelemetry/api'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base'
import test from 'ava'
import { pathExists } from 'path-exists'
import semver from 'semver'

import { trackBundleResults } from '../../lib/log/messages/core_steps.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Functions: missing source directory', async (t) => {
  const output = await new Fixture('./fixtures/missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: must not be a regular file', async (t) => {
  const output = await new Fixture('./fixtures/regular_file').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: can be a symbolic link', async (t) => {
  const output = await new Fixture('./fixtures/symlink').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: default directory', async (t) => {
  const output = await new Fixture('./fixtures/default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: simple setup', async (t) => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  const output = await new Fixture('./fixtures/simple').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: no functions', async (t) => {
  const output = await new Fixture('./fixtures/none').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Functions: invalid package.json', async (t) => {
  const packageJsonPath = `${FIXTURES_DIR}/functions_package_json_invalid/package.json`
  // We need to create that file during tests. Otherwise, ESLint fails when
  // detecting an invalid *.json file.
  await writeFile(packageJsonPath, '{{}')
  try {
    const output = await new Fixture('./fixtures/functions_package_json_invalid').runWithBuild()
    // This shape of this error can change with different Node.js versions.
    t.true(output.includes('in JSON at position 1'))
  } finally {
    await rm(packageJsonPath, { force: true, recursive: true, maxRetries: 10 })
  }
})

test('Functions: --functionsDistDir', async (t) => {
  const functionsDistDir = await getTempName()
  try {
    const output = await new Fixture('./fixtures/simple')
      .withFlags({ mode: 'buildbot', functionsDistDir })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    t.true(await pathExists(functionsDistDir))
    const files = await readdir(functionsDistDir)
    // We're expecting two files: the function ZIP and the manifest.
    t.is(files.length, 2)
  } finally {
    await removeDir(functionsDistDir)
  }
})

test('Functions: custom path on scheduled function', async (t) => {
  const output = await new Fixture('./fixtures/custom_path_scheduled').runWithBuild()
  t.true(output.includes('Scheduled functions must not specify a custom path.'))
})

test('Functions: custom path on event-triggered function', async (t) => {
  const output = await new Fixture('./fixtures/custom_path_event_triggered').runWithBuild()
  t.true(output.includes('Event-triggered functions must not specify a custom path.'))
})

test('Functions: internal functions are cleared on the dev timeline', async (t) => {
  const fixture = await new Fixture('./fixtures/functions_leftover')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  // Before starting Netlify Build, the leftover files should exist and the
  // generated files should not.
  await stat(`${fixture.repositoryRoot}/.netlify/functions-internal/leftover.mjs`)
  await stat(`${fixture.repositoryRoot}/.netlify/edge-functions/leftover.mjs`)
  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/functions-internal/from-plugin.mjs`), {
    code: 'ENOENT',
  })
  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/edge-functions/from-plugin.mjs`), {
    code: 'ENOENT',
  })

  await fixture.runDev(() => {})

  // After running Netlify Build, the leftover files should have been removed
  // but the generated files should have been preserved.
  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/functions-internal/leftover.mjs`), {
    code: 'ENOENT',
  })
  await t.throwsAsync(() => stat(`${fixture.repositoryRoot}/.netlify/edge-functions/leftover.mjs`), { code: 'ENOENT' })
  await stat(`${fixture.repositoryRoot}/.netlify/functions-internal/from-plugin.mjs`)
  await stat(`${fixture.repositoryRoot}/.netlify/edge-functions/from-plugin.mjs`)
})

test('Functions: cleanup is only triggered when there are internal functions', async (t) => {
  const fixture = await new Fixture('./fixtures/internal_functions')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  await rm(`${fixture.repositoryRoot}/.netlify/functions-internal/`, { force: true, recursive: true })
  await rm(`${fixture.repositoryRoot}/.netlify/edge-functions/`, { force: true, recursive: true })

  const output = await fixture.runDev(() => {})
  t.false(output.includes('Cleaning up leftover files from previous builds'))
})

test('Functions: loads functions generated with the Frameworks API', async (t) => {
  const fixture = await new Fixture('./fixtures/functions_user_and_frameworks')
    .withFlags({ debug: false })
    .withCopyRoot()

  const output = await fixture.runWithBuild()
  const functionsDist = await readdir(resolve(fixture.repositoryRoot, '.netlify/functions'))

  t.true(functionsDist.includes('manifest.json'))
  t.true(functionsDist.includes('server.zip'))
  t.true(functionsDist.includes('user.zip'))

  t.snapshot(normalizeOutput(output))
})

test('Functions: loads functions from the `.netlify/functions-internal` directory and the Frameworks API', async (t) => {
  const fixture = await new Fixture('./fixtures/functions_user_internal_and_frameworks')
    .withFlags({ debug: false })
    .withCopyRoot()

  const output = await fixture.runWithBuild()
  const functionsDist = await readdir(resolve(fixture.repositoryRoot, '.netlify/functions'))

  t.true(functionsDist.includes('manifest.json'))
  t.true(functionsDist.includes('server.zip'))
  t.true(functionsDist.includes('user.zip'))
  t.true(functionsDist.includes('server-internal.zip'))

  const manifest = await readFile(resolve(fixture.repositoryRoot, '.netlify/functions/manifest.json'), 'utf8')
  const { functions } = JSON.parse(manifest)

  t.is(functions.length, 5)

  // The Frameworks API takes precedence over the legacy internal directory.
  const frameworksInternalConflict = functions.find(({ name }) => name === 'frameworks-internal-conflict')
  t.is(frameworksInternalConflict.routes[0].pattern, '/frameworks-internal-conflict/frameworks')

  // User code takes precedence over the Frameworks API.
  const frameworksUserConflict = functions.find(({ name }) => name === 'frameworks-user-conflict')
  t.is(frameworksUserConflict.routes[0].pattern, '/frameworks-user-conflict/user')

  t.snapshot(normalizeOutput(output))
})

// the monorepo works with pnpm which is not always available
if (semver.gte(nodeVersion, '18.19.0')) {
  test('Functions: loads functions generated with the Frameworks API in a monorepo setup', async (t) => {
    const fixture = await new Fixture('./fixtures/functions_monorepo').withCopyRoot({ git: false })
    const app1 = await fixture
      .withFlags({
        cwd: fixture.repositoryRoot,
        packagePath: 'apps/app-1',
      })
      .runWithBuildAndIntrospect()

    t.true(app1.success)

    const app2 = await fixture
      .withFlags({
        cwd: fixture.repositoryRoot,
        packagePath: 'apps/app-2',
      })
      .runWithBuildAndIntrospect()

    t.true(app2.success)

    const app1FunctionsDist = await readdir(resolve(fixture.repositoryRoot, 'apps/app-1/.netlify/functions'))
    t.is(app1FunctionsDist.length, 2)
    t.true(app1FunctionsDist.includes('manifest.json'))
    t.true(app1FunctionsDist.includes('server.zip'))

    const app2FunctionsDist = await readdir(resolve(fixture.repositoryRoot, 'apps/app-2/.netlify/functions'))
    t.is(app2FunctionsDist.length, 3)
    t.true(app2FunctionsDist.includes('manifest.json'))
    t.true(app2FunctionsDist.includes('server.zip'))
    t.true(app2FunctionsDist.includes('worker.zip'))
  })
}

const createContextManager = (activeContext) => ({
  with: (_, fn, thisArg, ...args) => fn.call(thisArg, ...args),
  active: () => activeContext,
  enable: () => activeContext,
  disable: () => activeContext,
})

const withActiveSpan = (fn) => {
  trace.setGlobalTracerProvider(new BasicTracerProvider())
  const span = trace.getTracer('test').startSpan('functions_bundling')
  context.setGlobalContextManager(createContextManager(trace.setSpan(ROOT_CONTEXT, span)))
  try {
    return fn(span)
  } finally {
    context.disable()
    trace.disable()
  }
}

const fakeResult = (overrides = {}) => ({
  name: 'fn',
  runtime: 'js',
  bundler: 'zisi',
  ...overrides,
})

test.serial('trackBundleResults: sets bundler-summary attributes on the active span', (t) => {
  withActiveSpan((span) => {
    trackBundleResults({
      systemLog: () => {},
      results: [
        fakeResult({ name: 'a', bundler: 'esbuild' }),
        fakeResult({ name: 'b', bundler: 'esbuild', bundlerWarnings: [{}] }),
        fakeResult({ name: 'c', bundler: 'zisi', bundlerErrors: [{}] }),
        fakeResult({ name: 'd', runtime: 'go', bundler: undefined }),
      ],
    })
    t.deepEqual(span.attributes['build.execution.step.bundler'], ['esbuild', 'zisi'])
    t.is(span.attributes['build.execution.step.functions_count'], 4)
    t.is(span.attributes['build.execution.step.bundler.fallback_count'], 1)
    t.is(span.attributes['build.execution.step.bundler.warnings_count'], 1)
    t.is(span.attributes['build.execution.step.bundler.esbuild.count'], 2)
    t.is(span.attributes['build.execution.step.bundler.zisi.count'], 1)
  })
})

test.serial('trackBundleResults: writes the rich summary to the system log', (t) => {
  withActiveSpan(() => {
    const messages = []
    trackBundleResults({
      systemLog: (...args) => messages.push(args),
      results: [fakeResult({ name: 'a', bundler: 'zisi', bundlerErrors: [{}] })],
    })
    t.deepEqual(messages, [
      [
        {
          msg: 'Functions bundling completed',
          bundlers: ['zisi'],
          bundlerCounts: { zisi: 1 },
          fallbackCount: 1,
          warningsCount: 0,
          functions: [
            {
              name: 'a',
              runtime: 'js',
              bundler: 'zisi',
              hadFallback: true,
              hadWarnings: false,
            },
          ],
        },
      ],
    ])
  })
})

test.serial('trackBundleResults: returns summary stats for metric tags', (t) => {
  withActiveSpan(() => {
    const summary = trackBundleResults({
      systemLog: () => {},
      results: [
        fakeResult({ name: 'a', bundler: 'esbuild' }),
        fakeResult({ name: 'b', bundler: 'zisi', bundlerErrors: [{}] }),
      ],
    })
    t.deepEqual(summary, { bundlers: ['esbuild', 'zisi'], fallbackCount: 1, warningsCount: 0 })
  })
})

// Prebuilt `.zip` JS functions pass through zip-it-and-ship-it with no
// `bundler` field. They should not pollute `bundlers` with `undefined`.
test.serial('trackBundleResults: excludes JS results that have no bundler (prebuilt .zip)', (t) => {
  withActiveSpan((span) => {
    const summary = trackBundleResults({
      systemLog: () => {},
      results: [
        fakeResult({ name: 'a', bundler: 'esbuild' }),
        fakeResult({ name: 'b', bundler: undefined }), // prebuilt .zip
      ],
    })
    t.deepEqual(summary.bundlers, ['esbuild'])
    t.deepEqual(span.attributes['build.execution.step.bundler'], ['esbuild'])
    t.is(span.attributes['build.execution.step.bundler.esbuild.count'], 1)
    t.is(span.attributes['build.execution.step.bundler.undefined.count'], undefined)
  })
})

test('Functions: creates metadata file', async (t) => {
  const fixture = await new Fixture('./fixtures/v2').withCopyRoot({ git: false })
  const build = await fixture
    .withFlags({
      branch: 'my-branch',
      cwd: fixture.repositoryRoot,
    })
    .runWithBuildAndIntrospect()

  t.true(build.success)

  const functionsDistPath = resolve(fixture.repositoryRoot, '.netlify/functions')
  const functionsDistFiles = await readdir(functionsDistPath)

  t.true(functionsDistFiles.includes('manifest.json'))
  t.true(functionsDistFiles.includes('test.zip'))

  const unzipPath = join(functionsDistPath, `.netlify-test-${Date.now()}`)

  await unzipFile(join(functionsDistPath, 'test.zip'), unzipPath)

  const functionFiles = await readdir(unzipPath)

  t.true(functionFiles.includes('___netlify-bootstrap.mjs'))
  t.true(functionFiles.includes('___netlify-entry-point.mjs'))
  t.true(functionFiles.includes('___netlify-metadata.json'))
  t.true(functionFiles.includes('test.mjs'))

  const metadata = JSON.parse(await readFile(join(unzipPath, '___netlify-metadata.json'), 'utf8'))

  t.is(semver.valid(metadata.bootstrap_version), metadata.bootstrap_version)
  t.is(metadata.branch, 'my-branch')
  t.is(metadata.version, 1)
})
