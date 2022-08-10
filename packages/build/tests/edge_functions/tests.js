import { promises as fs } from 'fs'
import { join } from 'path'

import test from 'ava'
import { pathExists } from 'path-exists'
import tmp from 'tmp-promise'

import { FIXTURES_DIR, runFixture } from '../helpers/main.js'

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
  await runFixture(t, 'src_default', { flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_SRC automatic value', async (t) => {
  await runFixture(t, 'src_auto', { flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_SRC relative path', async (t) => {
  await runFixture(t, 'src_relative', { flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_SRC missing path', async (t) => {
  await runFixture(t, 'src_missing', { flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_SRC created dynamically', async (t) => {
  await runFixture(t, 'src_dynamic', { copyRoot: { git: false }, flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_SRC dynamic is ignored if EDGE_FUNCTIONS_SRC is specified', async (t) => {
  await runFixture(t, 'src_dynamic_ignore', { copyRoot: { git: false }, flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_DIST default value', async (t) => {
  await runFixture(t, 'print_dist', { flags: { debug: false } })
})

test('constants.EDGE_FUNCTIONS_DIST custom value', async (t) => {
  await runFixture(t, 'print_dist', {
    flags: { debug: false, mode: 'buildbot', edgeFunctionsDistDir: '/another/path' },
  })
})

test.serial('builds Edge Functions from the user-defined directory', async (t) => {
  const fixtureName = 'functions_user'

  await runFixture(t, 'functions_user', { flags: { debug: false, mode: 'buildbot' } })
  await assertManifest(t, fixtureName)
})

test.serial('builds Edge Functions from the internal directory', async (t) => {
  const fixtureName = 'functions_internal'

  await runFixture(t, 'functions_internal', { flags: { debug: false, mode: 'buildbot' } })
  await assertManifest(t, fixtureName)
})

test.serial('builds Edge Functions from both the user and the internal directoriws', async (t) => {
  const fixtureName = 'functions_user_internal'

  await runFixture(t, fixtureName, { flags: { debug: false, mode: 'buildbot' } })
  await assertManifest(t, fixtureName)
})

test.serial('handles failure when bundling Edge Functions', async (t) => {
  await runFixture(t, 'functions_invalid', { flags: { debug: false } })
})

test('bundles Edge Functions via runCoreSteps function', async (t) => {
  const fixtureName = 'functions_user'

  await runFixture(t, fixtureName, {
    flags: { buildSteps: ['edge_functions_bundling'], debug: false, useRunCoreSteps: true },
  })
  await assertManifest(t, fixtureName)
})

test('handles failure when bundling Edge Functions via runCoreSteps function', async (t) => {
  const { returnValue } = await runFixture(t, 'functions_invalid', {
    flags: { buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true },
    snapshot: false,
  })

  t.true(returnValue.includes("The module's source code could not be parsed"))
})

test.serial('writes manifest contents to stdout if `debug` is set', async (t) => {
  // This file descriptor doesn't exist, but it won't be used anyway since
  // `debug` is set.
  const systemLogFile = 7
  const { returnValue } = await runFixture(t, 'functions_user', {
    flags: {
      debug: true,
      mode: 'buildbot',
      systemLogFile,
    },
  })

  t.regex(
    returnValue,
    /Edge Functions manifest: {"bundles":\[{"asset":"[a-fA-F\d]{64}\.js","format":"js"}],"routes":\[{"function":"function-1","pattern":"\^\/one\/\?\$"}],"bundler_version":"\d+\.\d+\.\d+"}/,
  )
})

test.serial('writes manifest contents to system logs if `systemLogFile` is set', async (t) => {
  const { fd, cleanup, path } = await tmp.file()

  await runFixture(t, 'functions_user', {
    flags: { debug: false, mode: 'buildbot', systemLogFile: fd },
  })

  const fileContents = await fs.readFile(path, 'utf8')

  await cleanup()

  t.regex(
    fileContents,
    /Edge Functions manifest: {"bundles":\[{"asset":"[a-fA-F\d]{64}\.js","format":"js"}],"routes":\[{"function":"function-1","pattern":"\^\/one\/\?\$"}],"bundler_version":"\d+\.\d+\.\d+"}/,
  )
})
