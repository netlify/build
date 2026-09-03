import { promises as fs, existsSync } from 'fs'
import { join } from 'path'
import { platform } from 'process'
import { fileURLToPath } from 'url'

import { DenoBridge, type Manifest } from '@netlify/edge-bundler'
import { Fixture, normalizeOutput } from '@netlify/testing'
import semver from 'semver'
import tmp from 'tmp-promise'
import { expect, test } from 'vitest'

import { importJsonFile } from '../../lib/utils/json.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

interface Variant {
  id: string
  flags: {
    debug: boolean
    featureFlags?: { edge_bundler_generate_tarball?: boolean }
  }
}

const assertManifest = async (fixtureName: string) => {
  const distPath = join(FIXTURES_DIR, fixtureName, '.netlify', 'edge-functions-dist')
  const manifestPath = join(distPath, 'manifest.json')

  expect(existsSync(manifestPath)).toBe(true)

  const manifest = await importJsonFile<Manifest>(manifestPath)

  for (const bundle of manifest.bundles) {
    const bundlePath = join(distPath, bundle.asset)

    expect(existsSync(bundlePath)).toBe(true)
  }

  return manifest
}

const assertBundlesExist = (manifest: Manifest, variant: Variant) => {
  const hasTarball = manifest.bundles.some(({ format }) => format === 'tar')
  const hasEszip = manifest.bundles.some(({ format }) => format === 'eszip2')

  expect(hasEszip).toBe(true)

  if (variant.flags.featureFlags?.edge_bundler_generate_tarball) {
    expect(hasTarball).toBe(true)
  }
}

const getDenoVersion = async () => {
  try {
    const bridge = new DenoBridge({ useGlobal: true })
    const result = await bridge.getBinaryVersion('deno')
    return result.version ?? null
  } catch {
    return null
  }
}

const isDenoVersionSupported = (version: string | null) => {
  if (!version) return false
  return semver.satisfies(version, '>=2.4.2')
}

const denoVersion = await getDenoVersion()
const FLAG_VARIANTS: Variant[] = isDenoVersionSupported(denoVersion)
  ? [
      { id: 'default', flags: { debug: false } },
      {
        id: 'tarball',
        flags: { debug: false, featureFlags: { edge_bundler_generate_tarball: true } },
      },
    ]
  : [{ id: 'default', flags: { debug: false } }]

for (const variant of FLAG_VARIANTS) {
  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC default value', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/src_default').withFlags(variant.flags).runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC automatic value', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/src_auto').withFlags(variant.flags).runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC relative path', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/src_relative').withFlags(variant.flags).runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC missing path', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/src_missing').withFlags(variant.flags).runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_SRC created dynamically', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/src_dynamic')
      .withFlags(variant.flags)
      .withCopyRoot({ git: false })
      .then((fixture) => fixture.runWithBuild())
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(
    variant.id + ' - constants.EDGE_FUNCTIONS_SRC dynamic is ignored if EDGE_FUNCTIONS_SRC is specified',
    async () => {
      const output = await new Fixture(import.meta.url, './fixtures/src_dynamic_ignore')
        .withFlags(variant.flags)
        .withCopyRoot({ git: false })
        .then((fixture) => fixture.runWithBuild())
      expect(normalizeOutput(output)).toMatchSnapshot()
    },
  )

  test(variant.id + ' - constants.EDGE_FUNCTIONS_DIST default value', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/print_dist').withFlags(variant.flags).runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - constants.EDGE_FUNCTIONS_DIST custom value', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/print_dist')
      .withFlags({ ...variant.flags, mode: 'buildbot', edgeFunctionsDistDir: '/another/path' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - builds Edge Functions from the user-defined directory', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_user')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    const manifest = await assertManifest('functions_user')
    assertBundlesExist(manifest, variant)
  })

  test(variant.id + ' - builds Edge Functions from the internal directory', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_internal')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    const manifest = await assertManifest('functions_internal')
    assertBundlesExist(manifest, variant)
    const manifestPath = join(FIXTURES_DIR, 'functions_internal/.netlify/edge-functions-dist/manifest.json')

    const { routes, function_config } = await importJsonFile<Manifest>(manifestPath)

    expect(routes).toEqual([{ function: 'function-1', pattern: '^(?:/(.*))/?$', excluded_patterns: [], path: '/*' }])
    expect(function_config).toEqual({ 'function-1': { generator: 'internalFunc' } })
  })

  test(variant.id + ' - builds Edge Functions from both the user and the internal directories', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_user_internal')
      .withFlags({ ...variant.flags, mode: 'buildbot' })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    const manifest = await assertManifest('functions_user_internal')
    assertBundlesExist(manifest, variant)
  })

  // TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
  // out which regex is causing the problem and fix it.
  if (platform !== 'win32') {
    test(variant.id + ' - handles failure when bundling Edge Functions', async () => {
      const output = await new Fixture(import.meta.url, './fixtures/functions_invalid')
        .withFlags(variant.flags)
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()
    })
  }

  // Does not work because the validator is memoized in edge-bundler and the ff has no effect during runtime.
  // Enable test once removing FF
  test.todo(variant.id + ' - handles failure when validating Edge Functions', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_validation_failed')
      .withFlags({ debug: false, featureFlags: { edge_functions_manifest_validate_slash: true } })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })

  test(variant.id + ' - bundles Edge Functions via runCoreSteps function', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_user')
      .withFlags({ ...variant.flags, buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true })
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    const manifest = await assertManifest('functions_user')
    assertBundlesExist(manifest, variant)
  })

  test(variant.id + ' - handles failure when bundling Edge Functions via runCoreSteps function', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_invalid')
      .withFlags({ ...variant.flags, buildSteps: ['edge_functions_bundling'], useRunCoreSteps: true })
      .runWithBuild()

    expect(output).toContain("The module's source code could not be parsed")
  })

  // TODO: Snapshot normalizer is not handling Windows paths correctly. Figure
  // out which regex is causing the problem and fix it.
  if (platform !== 'win32') {
    test(variant.id + ' - writes manifest contents to stdout if `debug` is set', async () => {
      // This file descriptor doesn't exist, but it won't be used anyway since
      // `debug` is set.
      const systemLogFile = 7
      const output = await new Fixture(import.meta.url, './fixtures/functions_user')
        .withFlags({
          debug: true,
          mode: 'buildbot',
          systemLogFile,
        })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()

      expect(output).toMatch(/Edge Functions manifest: \{/)
    })
  }

  test(variant.id + ' - writes manifest contents to system logs if `systemLogFile` is set', async () => {
    const { fd, cleanup, path } = await tmp.file()

    try {
      const output = await new Fixture(import.meta.url, './fixtures/functions_user')
        .withFlags({ ...variant.flags, mode: 'buildbot', systemLogFile: fd })
        .runWithBuild()
      expect(normalizeOutput(output)).toMatchSnapshot()

      const fileContents = await fs.readFile(path, 'utf8')

      expect(fileContents).toMatch(/Edge Functions manifest: \{/)
    } finally {
      await cleanup()
    }
  })

  test(variant.id + ' - build plugins can manipulate netlifyToml.edge_functions array', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_plugin_mutations')
      .withFlags(variant.flags)
      .runWithBuild()
    expect(normalizeOutput(output)).toMatchSnapshot()
    const manifest = await assertManifest('functions_plugin_mutations')
    assertBundlesExist(manifest, variant)
    const manifestPath = join(FIXTURES_DIR, 'functions_plugin_mutations/.netlify/edge-functions-dist/manifest.json')

    const { routes } = await importJsonFile<Manifest>(manifestPath)

    expect(routes).toEqual([
      { function: 'mutated-function', pattern: '^/test-test/?$', excluded_patterns: [], path: '/test-test' },
    ])
  })

  test(variant.id + ' - cleans up the edge functions dist directory before bundling', async () => {
    const fixture = new Fixture(import.meta.url, './fixtures/functions_user')
    const distDirectory = join(fixture.repositoryRoot, '.netlify', 'edge-functions-dist')
    const oldBundlePath = join(distDirectory, 'old.eszip')
    const manifestPath = join(distDirectory, 'manifest.json')

    await fs.rm(distDirectory, { recursive: true, force: true })
    await fs.mkdir(distDirectory, { recursive: true })
    await fs.writeFile(oldBundlePath, 'some-data')
    await fs.writeFile(manifestPath, '{}')

    expect(existsSync(oldBundlePath)).toBe(true)
    expect(existsSync(manifestPath)).toBe(true)

    await fixture.withFlags({ ...variant.flags, mode: 'buildbot' }).runWithBuild()

    const manifest = await assertManifest('functions_user')
    assertBundlesExist(manifest, variant)

    const oldBundleAsset = manifest.bundles.find((bundle) => bundle.asset === 'old.eszip')
    expect(oldBundleAsset).toBe(undefined)

    expect(existsSync(oldBundlePath)).toBe(false)
  })

  test(variant.id + ' - builds edge functions generated with the Frameworks API', async () => {
    const output = await new Fixture(import.meta.url, './fixtures/functions_user_framework')
      .withFlags({
        ...variant.flags,
        mode: 'buildbot',
      })
      .runWithBuild()

    expect(normalizeOutput(output)).toMatchSnapshot()

    const manifest = await assertManifest('functions_user_framework')
    assertBundlesExist(manifest, variant)
    const { routes } = manifest

    expect(routes).toHaveLength(1)
    expect(routes[0]).toEqual({
      function: 'function-2',
      pattern: '^/framework(?:/(.*))/?$',
      excluded_patterns: ['^/framework/skip_(.*)/?$'],
      path: '/framework/*',
    })
  })

  test(
    variant.id +
      ' - builds both edge functions generated with the Frameworks API and the ones in the internal directory',
    async () => {
      const output = await new Fixture(import.meta.url, './fixtures/functions_user_internal_framework')
        .withFlags({
          ...variant.flags,
          mode: 'buildbot',
        })
        .runWithBuild()

      expect(normalizeOutput(output)).toMatchSnapshot()

      const manifest = await assertManifest('functions_user_internal_framework')
      assertBundlesExist(manifest, variant)
      const { routes } = manifest

      expect(routes).toEqual([
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

  test(variant.id + ' - honors declarative `edge_functions` routes from the Frameworks API config file', async () => {
    await new Fixture(import.meta.url, './fixtures/functions_frameworks_api_config')
      .withFlags({
        ...variant.flags,
        mode: 'buildbot',
      })
      .runWithBuild()

    const manifest = await assertManifest('functions_frameworks_api_config')
    assertBundlesExist(manifest, variant)
    const { routes, function_config } = manifest

    // `path` and `excludedPath` become the route pattern and excluded patterns.
    // `framework-edge-isc` declares a route in its in-source config too, so it
    // gets a route from each source.
    expect(routes).toEqual([
      {
        function: 'framework-edge-isc',
        pattern: '^/isc-route(?:/(.*))/?$',
        excluded_patterns: [],
        path: '/isc-route/*',
      },
      {
        function: 'framework-edge',
        pattern: '^/framework-route(?:/(.*))/?$',
        excluded_patterns: ['^/framework-route/static(?:/(.*))/?$', '^/framework-route/skip/?$'],
        path: '/framework-route/*',
      },
      {
        function: 'framework-edge-isc',
        pattern: '^/declaration-route(?:/(.*))/?$',
        excluded_patterns: [],
        path: '/declaration-route/*',
      },
    ])

    // `name` and `generator` are carried through to the function config, whether
    // or not the function also has in-source config.
    expect(function_config['framework-edge']).toEqual({
      name: 'Framework edge function',
      generator: 'package-name@1.2.3',
    })
    expect(function_config['framework-edge-isc']).toEqual({
      name: 'Framework edge function with in-source config',
      generator: 'package-name@1.2.3',
    })
  })

  test(variant.id + ' - skip bundling when edge function directories exist, contain no functions', async () => {
    await new Fixture(import.meta.url, './fixtures/functions_empty_directory').withFlags(variant.flags).runWithBuild()

    const manifestPath = join(
      FIXTURES_DIR,
      'functions_empty_directory',
      '.netlify',
      'edge-functions-dist',
      'manifest.json',
    )

    expect(existsSync(manifestPath)).toBe(false)
  })

  test(
    variant.id + ' - skip bundling when edge function directories exist, contain no functions, contain empty manifest',
    async () => {
      await new Fixture(import.meta.url, './fixtures/functions_empty_manifest').withFlags(variant.flags).runWithBuild()

      const manifestPath = join(
        FIXTURES_DIR,
        'functions_empty_manifest',
        '.netlify',
        'edge-functions-dist',
        'manifest.json',
      )

      expect(existsSync(manifestPath)).toBe(false)
    },
  )
}
