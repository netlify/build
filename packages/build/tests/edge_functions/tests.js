import { promises as fs } from 'fs'
import { join } from 'path'
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

  const manifestFile = await fs.readFile(manifestPath)
  const { bundles } = JSON.parse(manifestFile)

  await Promise.all(
    bundles.map(async (bundle) => {
      const bundlePath = join(distPath, bundle.asset)

      t.true(await pathExists(bundlePath))
    }),
  )
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
    .withFlags({ debug: false, featureFlags: { edge_functions_produce_eszip: true }, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_internal')
})

test.serial('builds Edge Functions from both the user and the internal directoriws', async (t) => {
  const output = await new Fixture('./fixtures/functions_user_internal')
    .withFlags({ debug: false, mode: 'buildbot' })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
  await assertManifest(t, 'functions_user_internal')
})

test.serial('handles failure when bundling Edge Functions', async (t) => {
  const output = await new Fixture('./fixtures/functions_invalid').withFlags({ debug: false }).runWithBuild()
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

  t.deepEqual(routes, [{ function: 'mutated-function', pattern: '^/test-test/?$' }])
})
