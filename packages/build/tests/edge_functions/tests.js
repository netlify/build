import { promises as fs } from 'fs'
import { join } from 'path'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { DenoBridge } from '@netlify/edge-bundler'
import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import { pathExists } from 'path-exists'
import semver from 'semver'
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

const assertBundlesExist = (t, manifest, variant) => {
  const hasTarball = manifest.bundles.some(({ format }) => format === 'tar')
  const hasEszip = manifest.bundles.some(({ format }) => format === 'eszip2')

  t.true(hasEszip)

  if (variant?.flags?.featureFlags?.edge_bundler_generate_tarball) {
    t.true(hasTarball)
  }
}

const getDenoVersion = async () => {
  try {
    const bridge = new DenoBridge({ useGlobal: true })
    const result = await bridge.getBinaryVersion('deno')
    return result.version
  } catch {
    return null
  }
}

const isDenoVersionSupported = (version) => {
  if (!version) return false
  return semver.satisfies(version, '>=2.4.2')
}

const denoVersion = await getDenoVersion()
const FLAG_VARIANTS = isDenoVersionSupported(denoVersion)
  ? [
      { id: 'default', flags: { debug: false } },
      {
        id: 'tarball',
        flags: { debug: false, featureFlags: { edge_bundler_generate_tarball: true } },
      },
    ]
  : [{ id: 'default', flags: { debug: false } }]

for (const variant of FLAG_VARIANTS) {
  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC default value', async (t) => {
    const output = await new Fixture('./fixtures/src_default').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC automatic value', async (t) => {
    const output = await new Fixture('./fixtures/src_auto').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC relative path', async (t) => {
    const output = await new Fixture('./fixtures/src_relative').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC missing path', async (t) => {
    const output = await new Fixture('./fixtures/src_missing').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC created dynamically', async (t) => {
    const output = await new Fixture('./fixtures/src_dynamic')
      .withFlags(variant.flags)
      .withCopyRoot({ git: false })
      .then((fixture) => fixture.runWithBuild())
    t.snapshot(normalizeOutput(output))
  })

  test(
    variant.id + ' - constants.EDGE_FUNCTIONS_SRC dynamic is ignored if EDGE_FUNCTIONS_SRC is specified',
    async (t) => {
      const output = await new Fixture('./fixtures/src_dynamic_ignore')
        .withFlags(variant.flags)
        .withCopyRoot({ git: false })
        .then((fixture) => fixture.runWithBuild())
      t.snapshot(normalizeOutput(output))
    },
  )

  test(variant.id + ' - constants.EDGE_FUNCTIONS_DIST default value', async (t) => {
    const output = await new Fixture('./fixtures/print_dist').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_DIST custom value', async (t) => {
    const output = await new Fixture('./fixtures/print_dist')
      .withFlags({ ...variant.flags, mode: 'buildbot', edgeFunctionsDistDir: '/another/path' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test.serial(variant.id + ' - builds Edge Functions from the user-defined directory', async (t) => {
    const output = await new Fixture('./fixtures/functions_user')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    const manifest = await assertManifest(t, 'functions_user')
    assertBundlesExist(t, manifest, variant)
  })

  test.serial(variant.id + ' - builds Edge Functions from the internal directory', async (t) => {
    const output = await new Fixture('./fixtures/functions_internal')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    const manifest = await assertManifest(t, 'functions_internal')
    assertBundlesExist(t, manifest, variant)
    const manifestPath = join(FIXTURES_DIR, 'functions_internal/.netlify/edge-functions-dist/manifest.json')

    const { routes, function_config } = await importJsonFile(manifestPath)

    t.deepEqual(routes, [{ function: 'function-1', pattern: '^(?:/(.*))/?$', excluded_patterns: [], path: '/*' }])
    t.deepEqual(function_config, { 'function-1': { generator: 'internalFunc' } })
  })

  test.serial(variant.id + ' - builds Edge Functions from both the user and the internal directories', async (t) => {
    const output = await new Fixture('./fixtures/functions_user_internal')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    const manifest = await assertManifest(t, 'functions_user_internal')
    assertBundlesExist(t, manifest, variant)
  })

  // TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
  // out which regex is causing the problem and fix it.
  if (platform !== 'win32') {
    test.serial(variant.id + ' - handles failure when bundling Edge Functions', async (t) => {
      const output = await new Fixture('./fixtures/functions_invalid').withFlags(variant.flags).runWithBuild()
      t.snapshot(normalizeOutput(output))
    })
  }

  // Does not work because the validator is memoized in edge-bundler and the ff has no effect during runtime.
  // Enable test once removing FF
  test.serial.skip(variant.id + ' - handles failure when validating Edge Functions', async (t) => {
    const output = await new Fixture('./fixtures/functions_validation_failed')
      .withFlags({ debug: false, featureFlags: { edge_functions_manifest_validate_slash: true } })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  })

  test(variant.id + ' - bundles Edge Functions via runCoreSteps function', async (t) => {
    const output = await new Fixture('./fixtures/functions_user')
      .withFlags({ ...variant.flags, buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
    const manifest = await assertManifest(t, 'functions_user')
    assertBundlesExist(t, manifest, variant)
  })

  test(variant.id + ' - handles failure when bundling Edge Functions via runCoreSteps function', async (t) => {
    const output = await new Fixture('./fixtures/functions_invalid')
      .withFlags({ ...variant.flags, buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true })
      .runWithBuild()

    t.true(output.includes("The module's source code could not be parsed"))
  })

  // TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
  // out which regex is causing the problem and fix it.
  if (platform !== 'win32') {
    test.serial(variant.id + ' - writes manifest contents to stdout if `debug` is set', async (t) => {
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

  test.serial(variant.id + ' - writes manifest contents to system logs if `systemLogFile` is set', async (t) => {
    const { fd, cleanup, path } = await tmp.file()

    try {
      const output = await new Fixture('./fixtures/functions_user')
        .withFlags({ ...variant.flags, mode: 'buildbot', systemLogFile: fd })
        .runWithBuild()
      t.snapshot(normalizeOutput(output))

      const fileContents = await fs.readFile(path, 'utf8')

      t.regex(fileContents, /Edge Functions manifest: \{/)
    } finally {
      await cleanup()
    }
  })

  test(variant.id + ' - build plugins can manipulate netlifyToml.edge_functions array', async (t) => {
    const output = await new Fixture('./fixtures/functions_plugin_mutations').withFlags(variant.flags).runWithBuild()
    t.snapshot(normalizeOutput(output))
    const manifest = await assertManifest(t, 'functions_plugin_mutations')
    assertBundlesExist(t, manifest, variant)
    const manifestPath = join(FIXTURES_DIR, 'functions_plugin_mutations/.netlify/edge-functions-dist/manifest.json')

    const { routes } = await importJsonFile(manifestPath)

    t.deepEqual(routes, [
      { function: 'mutated-function', pattern: '^/test-test/?$', excluded_patterns: [], path: '/test-test' },
    ])
  })

  test.serial(variant.id + ' - cleans up the edge functions dist directory before bundling', async (t) => {
    const fixture = new Fixture('./fixtures/functions_user')
    const distDirectory = join(fixture.repositoryRoot, '.netlify', 'edge-functions-dist')
    const oldBundlePath = join(distDirectory, 'old.eszip')
    const manifestPath = join(distDirectory, 'manifest.json')

    await fs.rm(distDirectory, { recursive: true, force: true })
    await fs.mkdir(distDirectory, { recursive: true })
    await fs.writeFile(oldBundlePath, 'some-data')
    await fs.writeFile(manifestPath, '{}')

    t.true(await pathExists(oldBundlePath))
    t.true(await pathExists(manifestPath))

    await fixture.withFlags({ ...variant.flags, mode: 'buildbot' }).runWithBuild()

    const manifest = await assertManifest(t, 'functions_user')
    assertBundlesExist(t, manifest, variant)

    const oldBundleAsset = manifest.bundles.find((bundle) => bundle.asset === 'old.eszip')
    t.is(oldBundleAsset, undefined)

    t.false(await pathExists(oldBundlePath))
  })

  test.serial(variant.id + ' - builds edge functions generated with the Frameworks API', async (t) => {
    const output = await new Fixture('./fixtures/functions_user_framework')
      .withFlags({
        ...variant.flags,
        mode: 'buildbot',
      })
      .runWithBuild()

    t.snapshot(normalizeOutput(output))

    const manifest = await assertManifest(t, 'functions_user_framework')
    assertBundlesExist(t, manifest, variant)
    const { routes } = manifest

    t.is(routes.length, 1)
    t.deepEqual(routes[0], {
      function: 'function-2',
      pattern: '^/framework(?:/(.*))/?$',
      excluded_patterns: ['^/framework/skip_(.*)/?$'],
      path: '/framework/*',
    })
  })

  test.serial(
    variant.id +
      ' - builds both edge functions generated with the Frameworks API and the ones in the internal directory',
    async (t) => {
      const output = await new Fixture('./fixtures/functions_user_internal_framework')
        .withFlags({
          ...variant.flags,
          mode: 'buildbot',
        })
        .runWithBuild()

      t.snapshot(normalizeOutput(output))

      const manifest = await assertManifest(t, 'functions_user_internal_framework')
      assertBundlesExist(t, manifest, variant)
      const { routes } = manifest

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

  test(variant.id + ' - skip bundling when edge function directories exist, contain no functions', async (t) => {
    await new Fixture('./fixtures/functions_empty_directory').withFlags(variant.flags).runWithBuild()

    const manifestPath = join(
      FIXTURES_DIR,
      'functions_empty_directory',
      '.netlify',
      'edge-functions-dist',
      'manifest.json',
    )

    t.false(await pathExists(manifestPath))
  })

  test(
    variant.id + ' - skip bundling when edge function directories exist, contain no functions, contain empty manifest',
    async (t) => {
      await new Fixture('./fixtures/functions_empty_manifest').withFlags(variant.flags).runWithBuild()

      const manifestPath = join(
        FIXTURES_DIR,
        'functions_empty_manifest',
        '.netlify',
        'edge-functions-dist',
        'manifest.json',
      )

      t.false(await pathExists(manifestPath))
    },
  )
}
