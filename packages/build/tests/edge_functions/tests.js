import { promises as fs } from 'fs'
import { join } from 'path'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import { pathExists } from 'path-exists'
import tmp from 'tmp-promise'

import { importJsonFile } from '../../lib/utils/json.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

const assertManifest = async (t, fixtureName) => {
  const distPath = join(FIXTURES_DIR, fixtureName, '.netlify', 'edge-functions-dist')
  const manifestPath = join(distPath, 'manifest.json')

  t.true(await pathExists(manifestPath))

  const manifestFile = await fs.readFile(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestFile)

  await Promise.all(
    manifest.bundles.map(async (bundle) => {
      const bundlePath = join(distPath, bundle.asset)

      t.true(await pathExists(bundlePath))
    }),
  )

  return manifest
}

test('constants.EDGE_FUNCTIONS_SRC default value', async (t) => {
  const output = await new Fixture('./fixtures/src_default').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_SRC automatic value', async (t) => {
  const output = await new Fixture('./fixtures/src_auto').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_SRC relative path', async (t) => {
  const output = await new Fixture('./fixtures/src_relative').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_SRC missing path', async (t) => {
  const output = await new Fixture('./fixtures/src_missing').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_SRC created dynamically', async (t) => {
  const output = await new Fixture('./fixtures/src_dynamic')
    .withFlags({ debug: false })
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_SRC dynamic is ignored if EDGE_FUNCTIONS_SRC is specified', async (t) => {
  const output = await new Fixture('./fixtures/src_dynamic_ignore')
    .withFlags({ debug: false })
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithBuild())
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_DIST default value', async (t) => {
  const output = await new Fixture('./fixtures/print_dist').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('constants.EDGE_FUNCTIONS_DIST custom value', async (t) => {
  const output = await new Fixture('./fixtures/print_dist')
    .withFlags({ debug: false, mode: 'buildbot', edgeFunctionsDistDir: '/another/path' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test.serial('builds Edge Functions from the user-defined directory', async (t) => {
  const output = await new Fixture('./fixtures/functions_user')
    .withFlags({ debug: false, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_user')
})

test.serial('builds Edge Functions from the internal directory', async (t) => {
  const output = await new Fixture('./fixtures/functions_internal')
    .withFlags({ debug: false, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_internal')
  const manifestPath = join(FIXTURES_DIR, 'functions_internal/.netlify/edge-functions-dist/manifest.json')

  const { routes, function_config } = await importJsonFile(manifestPath)

  t.deepEqual(routes, [{ function: 'function-1', pattern: '^(?:/(.*))/?$', excluded_patterns: [], path: '/*' }])
  t.deepEqual(function_config, { 'function-1': { generator: 'internalFunc' } })
})

test.serial('builds Edge Functions from both the user and the internal directories', async (t) => {
  const output = await new Fixture('./fixtures/functions_user_internal')
    .withFlags({ debug: false, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_user_internal')
})

// TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
// out which regex is causing the problem and fix it.
if (platform !== 'win32') {
  test.serial('handles failure when bundling Edge Functions', async (t) => {
    const output = await new Fixture('./fixtures/functions_invalid').withFlags({ debug: false }).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })
}

// Does not work because the validator is memoized in edge-bundler and the ff has no effect during runtime.
// Enable test once removing FF
test.serial.skip('handles failure when validating Edge Functions', async (t) => {
  const output = await new Fixture('./fixtures/functions_validation_failed')
    .withFlags({ debug: false, featureFlags: { edge_functions_manifest_validate_slash: true } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('bundles Edge Functions via runCoreSteps function', async (t) => {
  const output = await new Fixture('./fixtures/functions_user')
    .withFlags({ buildSteps: ['edge_functions_bundling'], debug: false, useRunCoreSteps: true })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_user')
})

test('handles failure when bundling Edge Functions via runCoreSteps function', async (t) => {
  const output = await new Fixture('./fixtures/functions_invalid')
    .withFlags({ buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true })
    .runWithBuild()

  t.true(output.includes("The module's source code could not be parsed"))
})

// TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
// out which regex is causing the problem and fix it.
if (platform !== 'win32') {
  test.serial('writes manifest contents to stdout if `debug` is set', async (t) => {
    // This file descriptor doesn't exist, but it won't be used anyway since
    // `debug` is set.
    const systemLogFile = 7
    const output = await new Fixture('./fixtures/functions_user')
      .withFlags({
        debug: true,
        mode: 'buildbot',
        systemLogFile,
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))

    t.regex(output, /Edge Functions manifest: \{/)
  })
}

test.serial('writes manifest contents to system logs if `systemLogFile` is set', async (t) => {
  const { fd, cleanup, path } = await tmp.file()

  const output = await new Fixture('./fixtures/functions_user')
    .withFlags({ debug: false, mode: 'buildbot', systemLogFile: fd })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))

  const fileContents = await fs.readFile(path, 'utf8')

  await cleanup()

  t.regex(fileContents, /Edge Functions manifest: \{/)
})

test('build plugins can manipulate netlifyToml.edge_functions array', async (t) => {
  const output = await new Fixture('./fixtures/functions_plugin_mutations').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_plugin_mutations')
  const manifestPath = join(FIXTURES_DIR, 'functions_plugin_mutations/.netlify/edge-functions-dist/manifest.json')

  const { routes } = await importJsonFile(manifestPath)

  t.deepEqual(routes, [
    { function: 'mutated-function', pattern: '^/test-test/?$', excluded_patterns: [], path: '/test-test' },
  ])
})

test.serial('cleans up the edge functions dist directory before bundling', async (t) => {
  const fixture = new Fixture('./fixtures/functions_user')
  const distDirectory = join(fixture.repositoryRoot, '.netlify', 'edge-functions-dist')
  const oldBundlePath = join(distDirectory, 'old.eszip')
  const manifestPath = join(distDirectory, 'manifest.json')

  await fs.writeFile(oldBundlePath, 'some-data')
  await fs.writeFile(manifestPath, '{}')

  t.true(await pathExists(oldBundlePath))
  t.true(await pathExists(manifestPath))

  await fixture.withFlags({ debug: false, mode: 'buildbot' }).runWithBuild()

  const manifest = await assertManifest(t, 'functions_user')

  t.is(manifest.bundles.length, 1)
  t.not(manifest.bundles[0].asset, 'old.eszip')

  t.false(await pathExists(oldBundlePath))
})

test.serial('builds edge functions generated with the Frameworks API', async (t) => {
  const output = await new Fixture('./fixtures/functions_user_framework')
    .withFlags({
      debug: false,
      mode: 'buildbot',
    })
    .runWithBuild()

  t.snapshot(normalizeOutput(output))

  const { routes } = await assertManifest(t, 'functions_user_framework')

  t.is(routes.length, 1)
  t.deepEqual(routes[0], {
    function: 'function-2',
    pattern: '^/framework(?:/(.*))/?$',
    excluded_patterns: ['^/framework/skip_(.*)/?$'],
    path: '/framework/*',
  })
})

test.serial(
  'builds both edge functions generated with the Frameworks API and the ones in the internal directory',
  async (t) => {
    const output = await new Fixture('./fixtures/functions_user_internal_framework')
      .withFlags({
        debug: false,
        mode: 'buildbot',
      })
      .runWithBuild()

    t.snapshot(normalizeOutput(output))

    const { routes } = await assertManifest(t, 'functions_user_internal_framework')

    t.deepEqual(routes, [
      {
        function: 'frameworks-internal-conflict',
        pattern: '^/frameworks-internal-conflict/frameworks/?$',
        excluded_patterns: [],
        path: '/frameworks-internal-conflict/frameworks',
      },
      {
        function: 'function-3',
        pattern: '^/internal(?:/(.*))/?$',
        excluded_patterns: ['^/internal/skip_(.*)/?$'],
        path: '/internal/*',
      },
      {
        function: 'frameworks-user-conflict',
        pattern: '^/frameworks-user-conflict/frameworks/?$',
        excluded_patterns: [],
        path: '/frameworks-user-conflict/frameworks',
      },
      {
        function: 'function-2',
        pattern: '^/framework(?:/(.*))/?$',
        excluded_patterns: ['^/framework/skip_(.*)/?$'],
        path: '/framework/*',
      },
      {
        function: 'frameworks-user-conflict',
        pattern: '^/frameworks-user-conflict/user/?$',
        excluded_patterns: [],
        path: '/frameworks-user-conflict/user',
      },
      {
        function: 'function-1',
        pattern: '^/user/?$',
        excluded_patterns: [],
        path: '/user',
      },
    ])
  },
)
