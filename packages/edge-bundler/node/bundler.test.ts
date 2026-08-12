import { Buffer } from 'buffer'
import { access, readdir, readFile, rm, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import process from 'process'
import { pathToFileURL } from 'url'

import { lt } from 'semver'
import * as tar from 'tar'
import tmp from 'tmp-promise'
import { test, expect, vi, describe } from 'vitest'

import { importMapSpecifier } from '../shared/consts.js'
import { denoVersion, runTarball, useFixture } from '../test/util.js'

import { BundleError } from './bundle_error.js'
import { bundle, BundleOptions } from './bundler.js'
import { Declaration } from './declaration.js'
import type { Manifest } from './manifest.js'
import { isFileNotFoundError } from './utils/error.js'
import { validateManifest } from './validation/manifest/index.js'

test('Produces a bundle', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps', { copyDirectory: true })
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const userDirectory = join(basePath, 'user-functions')
  const internalDirectory = join(basePath, 'functions')
  const result = await bundle([userDirectory, internalDirectory], distPath, declarations, {
    basePath,
    configPath: join(internalDirectory, 'config.json'),
    importMapPaths: [join(userDirectory, 'import_map.json')],
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(3)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  expect(() => validateManifest(manifest)).not.toThrowError()
  const { bundles, import_map: importMapURL } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(importMapURL).toBe(importMapSpecifier)

  const bundlePath = join(distPath, bundles[0].asset)
  const { func1, func2, func3 } = await runTarball(bundlePath)

  expect(func1).toBe('HELLO, JANE DOE!')
  expect(func2).toBe('Jane Doe')
  expect(func3).toBe('hello, netlify!')

  await cleanup()
})

test('Excludes functions with no route from the bundle when `edge_bundler_exclude_unrouted_functions` is enabled', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps', { copyDirectory: true })
  // Only `func1` is routed. `func2` and `func3` have no declaration, so they
  // should be left out of the bundle rather than eagerly loaded.
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const userDirectory = join(basePath, 'user-functions')
  const internalDirectory = join(basePath, 'functions')
  const result = await bundle([userDirectory, internalDirectory], distPath, declarations, {
    basePath,
    configPath: join(internalDirectory, 'config.json'),
    importMapPaths: [join(userDirectory, 'import_map.json')],
    featureFlags: { edge_bundler_exclude_unrouted_functions: true },
  })

  // The full set of discovered functions is still returned and reflected in the
  // manifest's `function_config`; only the bundle contents are trimmed.
  expect(result.functions.length).toBe(3)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile) as Manifest
  expect(() => validateManifest(manifest)).not.toThrowError()
  expect(manifest.routes.map((route) => route.function)).toEqual(['func1'])

  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const bundledFunctions = await runTarball(bundlePath)

  expect(Object.keys(bundledFunctions)).toEqual(['func1'])
  expect(bundledFunctions.func1).toBe('HELLO, JANE DOE!')
  expect(bundledFunctions.func2).toBeUndefined()
  expect(bundledFunctions.func3).toBeUndefined()

  await cleanup()
})

test('Produces no bundle or manifest when no function has a route and `edge_bundler_exclude_unrouted_functions` is enabled', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const userDirectory = join(basePath, 'user-functions')
  const internalDirectory = join(basePath, 'functions')

  // No declarations at all, so every function is unrouted. There is nothing that
  // can ever be invoked, so there is nothing to deploy: we produce no manifest,
  // rather than one with no bundle. The deploy pipeline can reject a bundle-less
  // manifest, whereas a missing manifest is the same well-handled path as a site
  // with no edge functions.
  const result = await bundle([userDirectory, internalDirectory], distPath, [], {
    basePath,
    configPath: join(internalDirectory, 'config.json'),
    importMapPaths: [join(userDirectory, 'import_map.json')],
    featureFlags: {
      edge_bundler_exclude_unrouted_functions: true,
    },
  })

  // The full set of discovered functions is still returned, but no manifest is.
  expect(result.functions.length).toBe(3)
  expect(result.manifest).toBeUndefined()

  await expect(access(resolve(distPath, 'manifest.json'))).rejects.toThrowError()

  await cleanup()
})

test('Adds a custom error property to user errors during bundling', async () => {
  process.env.NO_COLOR = 'true'
  expect.assertions(4)

  const { basePath, cleanup, distPath } = await useFixture('invalid_functions')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], distPath, declarations, { basePath })
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
    const message = (error as BundleError).message
      // eslint-disable-next-line no-control-regex
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      // Bundling happens in a temporary directory whose name is random, and
      // the error message quotes it.
      .replace(/[^\s"']*[/\\]tmp-\d+-[A-Za-z0-9]+/g, 'TMP_DIR')
      // On Windows those paths are built with the platform separator.
      .replaceAll('TMP_DIR\\', 'TMP_DIR/')

    // Deno words and lays out a parse failure differently across the range we
    // support (`DENO_VERSION_RANGE`): 2.4.x says "Unexpected eof", 2.5-2.7 say
    // "Expression expected", and 2.8+ reformats the whole thing as a
    // `SyntaxError` with a line gutter. Snapshot only the part we own - the
    // command we asked Deno to run - and assert Deno's own diagnostic loosely.
    const [commandLine] = message.split('\nerror:')

    expect(commandLine).toMatchSnapshot()
    expect(message).toMatch(/^error: (SyntaxError|The module's source code could not be parsed)/m)
    expect((error as BundleError).customErrorInfo).toEqual({
      location: {
        format: 'tar',
        runtime: 'deno',
      },
      type: 'functionsBundling',
    })
  } finally {
    await cleanup()
  }
})

test('Supports `npm:` specifiers', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module_scheme')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)

  // Deno resolves `npm:` specifiers natively when it vendors the bundle, so the
  // module is there at runtime.
  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe('function')

  await cleanup()
})

test('Does not add a custom error property to system errors during bundling', async () => {
  expect.assertions(1)

  try {
    // @ts-expect-error Sending bad input to `bundle` to force a system error.
    await bundle([123, 321], '/some/directory', declarations)
  } catch (error) {
    expect(error).not.toBeInstanceOf(BundleError)
  }
})

test('Uses the cache directory as the `DENO_DIR` value', async () => {
  expect.assertions(3)

  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const sourceDirectory = join(basePath, 'functions')
  const cacheDir = await tmp.dir()
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const options: BundleOptions = {
    basePath,
    cacheDirectory: cacheDir.path,
    configPath: join(sourceDirectory, 'config.json'),
  }

  const result = await bundle([sourceDirectory], distPath, declarations, options)
  const outFiles = await readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(outFiles.length).toBe(2)

  const denoDir = await readdir(join(cacheDir.path, 'deno_dir'))

  expect(denoDir.includes('gen')).toBe(true)

  await cleanup()
})

test('Supports import maps with relative paths', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    configPath: join(sourceDirectory, 'config.json'),
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await cleanup()
})

test('Ignores any user-defined `deno.json` files', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  // Creating an import map file that rewires the URL of the Deno registry to
  // an invalid location.
  const importMapFile = await tmp.file()
  const importMap = {
    imports: {
      'https://deno.land/': 'https://black.hole/',
    },
  }

  await writeFile(importMapFile.path, JSON.stringify(importMap))

  // Deno configuration files need to be in the current working directory.
  // There's not a great way for us to set the working directory of the `deno`
  // process that we'll run, so our best bet is to write the file to whatever
  // is the current working directory now and then clean it up.
  const denoConfigPath = join(process.cwd(), 'deno.json')
  const denoConfig = {
    importMap: importMapFile.path,
  }

  try {
    await access(denoConfigPath)

    throw new Error(
      `The file at '${denoConfigPath} would be overwritten by this test. Please move the file to a different location and try again.'`,
    )
  } catch (error) {
    if (!isFileNotFoundError(error)) {
      throw error
    }
  }

  await writeFile(denoConfigPath, JSON.stringify(denoConfig))

  expect(() =>
    bundle([sourceDirectory], distPath, declarations, {
      basePath,
      configPath: join(sourceDirectory, 'config.json'),
    }),
  ).not.toThrow()

  await cleanup()
  await rm(denoConfigPath, { force: true, recursive: true, maxRetries: 10 })
  await rm(importMapFile.path, { force: true, recursive: true, maxRetries: 10 })
})

test('Processes a function that imports a custom layer', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_layers')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const layer = { name: 'https://edge-function-layer-template.netlify.app/mod.ts', flag: 'edge-functions-layer-test' }
  const result = await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    configPath: join(sourceDirectory, 'config.json'),
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, layers } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(layers).toEqual([layer])

  await cleanup()
})

test('Loads declarations and import maps from the deploy configuration and in-source config', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_deploy_config')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const directories = [join(basePath, 'netlify', 'edge-functions'), join(basePath, '.netlify', 'edge-functions')]
  const result = await bundle(directories, distPath, declarations, {
    basePath,
    configPath: join(basePath, '.netlify', 'edge-functions', 'manifest.json'),
    internalSrcFolder: directories[1],
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(3)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, function_config: functionConfig, routes } = manifest
  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  // respects excludedPath from deploy config
  expect(routes[0].excluded_patterns).toEqual(['^/func2/skip/?$'])

  expect(functionConfig.func2).toEqual({
    name: 'Function two',
    generator: '@netlify/fake-plugin@1.0.0',
  })

  // respects in-source config
  expect(functionConfig.func3).toEqual({
    name: 'in-config-function',
    on_error: 'bypass',
    generator: 'internalFunc',
  })

  await cleanup()
})

test("Ignores entries in `importMapPaths` that don't point to an existing import map file", async () => {
  const systemLogger = vi.fn()
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const sourceDirectory = join(basePath, 'user-functions')

  // Creating import map file
  const importMap = await tmp.file()
  const importMapContents = {
    imports: {
      helper: pathToFileURL(join(basePath, 'helper.ts')).toString(),
    },
    scopes: {
      [pathToFileURL(join(sourceDirectory, 'func3/func3.ts')).toString()]: {
        helper: pathToFileURL(join(basePath, 'helper2.ts')).toString(),
      },
    },
  }

  await writeFile(importMap.path, JSON.stringify(importMapContents))

  const nonExistingImportMapPath = join(distPath, 'some-file-that-does-not-exist.json')
  const result = await bundle(
    [sourceDirectory],
    distPath,
    [
      {
        function: 'func1',
        path: '/func1',
      },
    ],
    {
      basePath,
      importMapPaths: [nonExistingImportMapPath, importMap.path],
      systemLogger,
    },
  )
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(2)
  expect(generatedFiles.length).toBe(2)
  expect(systemLogger).toHaveBeenCalledWith(`Did not find an import map file at '${nonExistingImportMapPath}'.`)

  await cleanup()
  await importMap.cleanup()
})

test('Handles imports with the `node:` prefix', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_node_specifier')
  const userDirectory = join(basePath, 'netlify', 'edge-functions')
  const result = await bundle([userDirectory], distPath, [], {
    basePath,
    importMapPaths: [join(userDirectory, 'import_map.json')],
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)

  expect(() => validateManifest(manifest)).not.toThrowError()

  const { bundles, import_map: importMapURL, routes } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(importMapURL).toBe(importMapSpecifier)
  expect(routes.length).toBe(1)
  expect(routes[0].function).toBe('func1')
  expect(routes[0].pattern).toBe('^/func1/?$')

  const bundlePath = join(distPath, bundles[0].asset)

  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe('ok')

  await cleanup()
})

test('Handles Node builtin imports without the `node:` prefix', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_node_builtin')
  const userDirectory = join(basePath, 'netlify', 'edge-functions')
  const result = await bundle([userDirectory], distPath, [], {
    basePath,
    importMapPaths: [join(userDirectory, 'import_map.json')],
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)

  expect(() => validateManifest(manifest)).not.toThrowError()

  const { bundles, import_map: importMapURL, routes } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(importMapURL).toBe(importMapSpecifier)
  expect(routes.length).toBe(1)
  expect(routes[0].function).toBe('func1')
  expect(routes[0].pattern).toBe('^/func1/?$')

  const bundlePath = join(distPath, bundles[0].asset)

  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe('ok')

  await cleanup()
})

test('Loads npm modules from bare specifiers', async () => {
  const systemLogger = vi.fn()
  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    importMapPaths: [join(basePath, 'import_map.json')],
    vendorDirectory: vendorDirectory.path,
    systemLogger,
  })

  expect(
    systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
  ).toBeUndefined()

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const { func1 } = await runTarball(bundlePath)

  // The bundle runs in the directory it was extracted into, so `process.cwd()`
  // is not the one this test runs in.
  expect(func1).toMatch(
    /^<parent-1><child-1>JavaScript<\/child-1><\/parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>.*<\/cwd><\/grandchild-1><\/child-2><\/parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>.*<\/cwd><\/grandchild-1><\/child-2><\/parent-3>, TmV0bGlmeQ==$/,
  )

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Loads npm modules which use package.json.exports', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module_exports')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    vendorDirectory: vendorDirectory.path,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe('hello')

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Loads modules which contain cycles', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_cycle')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    vendorDirectory: vendorDirectory.path,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe('magix')

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Loads npm modules in a monorepo setup', async () => {
  const systemLogger = vi.fn()
  const { basePath: rootPath, cleanup, distPath } = await useFixture('monorepo_npm_module')
  const basePath = join(rootPath, 'packages', 'frontend')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    importMapPaths: [join(basePath, 'import_map.json')],
    rootPath,
    vendorDirectory: vendorDirectory.path,
    systemLogger,
  })

  expect(
    systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
  ).toBeUndefined()

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const { func1 } = await runTarball(bundlePath)

  // The bundle runs in the directory it was extracted into, so `process.cwd()`
  // is not the one this test runs in.
  expect(func1).toMatch(
    /^<parent-1><child-1>JavaScript<\/child-1><\/parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>.*<\/cwd><\/grandchild-1><\/child-2><\/parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>.*<\/cwd><\/grandchild-1><\/child-2><\/parent-3>$/,
  )

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Loads JSON modules with `with` attribute', async () => {
  const { basePath, cleanup, distPath } = await useFixture('imports_json')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    vendorDirectory: vendorDirectory.path,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  const { func1 } = await runTarball(bundlePath)

  expect(func1).toBe(`{"foo":"bar"}`)

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Is backwards compatible with Deno 1.x', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_deno_1x_features')
  const sourceDirectory = join(basePath, 'functions')
  const vendorDirectory = await tmp.dir()
  const systemLogger = vi.fn()

  await bundle([sourceDirectory], distPath, [], {
    basePath,
    systemLogger,
    vendorDirectory: vendorDirectory.path,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)

  expect(systemLogger).toHaveBeenCalledWith(
    `Edge function uses import assertions: ${join(sourceDirectory, 'func1.ts')}`,
  )
  expect(manifest.routes[0]).toEqual({
    function: 'func1',
    pattern: '^/with-import-assert-ts/?$',
    excluded_patterns: [],
    path: '/with-import-assert-ts',
  })

  expect(systemLogger).toHaveBeenCalledWith(
    `Edge function uses import assertions: ${join(sourceDirectory, 'func2.js')}`,
  )
  expect(manifest.routes[1]).toEqual({
    function: 'func2',
    pattern: '^/with-import-assert-js/?$',
    excluded_patterns: [],
    path: '/with-import-assert-js',
  })

  expect(systemLogger).toHaveBeenCalledWith(
    `Edge function uses the window global: ${join(sourceDirectory, 'func3.ts')}`,
  )
  expect(manifest.routes[2]).toEqual({
    function: 'func3',
    pattern: '^/with-window-global-ts/?$',
    excluded_patterns: [],
    path: '/with-window-global-ts',
  })

  expect(systemLogger).toHaveBeenCalledWith(
    `Edge function uses the window global: ${join(sourceDirectory, 'func4.js')}`,
  )
  expect(manifest.routes[3]).toEqual({
    function: 'func4',
    pattern: '^/with-window-global-js/?$',
    excluded_patterns: [],
    path: '/with-window-global-js',
  })

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
})

test('Supports TSX and process.env', async () => {
  const { basePath, cleanup, distPath } = await useFixture('tsx')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const vendorDirectory = await tmp.dir()

  await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    vendorDirectory: vendorDirectory.path,
  })

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const bundlePath = join(distPath, manifest.bundles[0].asset)
  process.env.FOO = 'bar'
  const { func1 } = await runTarball(bundlePath)

  expect(Buffer.from(func1, 'base64').toString()).toBe(
    `hippedy hoppedy, createElement is now a production property. Here, take this env var: FOO=bar`,
  )

  await cleanup()
  await rm(vendorDirectory.path, { force: true, recursive: true })
  delete process.env.FOO
})

test('Loads edge functions from the Frameworks API', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_frameworks_api')
  const directories = [resolve(basePath, 'netlify/edge-functions'), resolve(basePath, '.netlify/v1/edge-functions')]
  const result = await bundle(directories, distPath, [], {
    basePath,
    internalSrcFolder: directories[1],
    importMapPaths: [resolve(basePath, '.netlify/v1/edge-functions/import_map.json')],
  })
  const generatedFiles = await readdir(distPath)

  expect(result.functions.length).toBe(3)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, function_config: functionConfig, routes } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('tar')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(routes[0].excluded_patterns).toEqual(['^/func2/skip/?$'])
  expect(functionConfig.func2).toEqual({
    excluded_patterns: ['^/func2/skip/?$'],
    name: 'Function two',
    generator: '@netlify/fake-plugin@1.0.0',
  })

  expect(functionConfig.func3).toEqual({
    name: 'in-config-function',
    on_error: 'bypass',
    generator: 'internalFunc',
  })

  await cleanup()
})

describe.skipIf(lt(denoVersion, '2.4.2'))(
  'Produces a tarball bundle',
  () => {
    test('With only local imports', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('imports_node_builtin', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        configPath: join(basePath, '.netlify/edge-functions/config.json'),
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: 'ok',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      expect(manifest.bundling_timing).toEqual({ tarball_ms: expect.any(Number) })

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      // Verify key files are present (vendor directory may contain additional files)
      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')
      expect(entries).toContain('./func1.ts')

      await cleanup()
    })

    test('Produces byte-identical tarballs when bundling the same code twice', async () => {
      const { basePath, cleanup, distPath } = await useFixture('imports_node_builtin', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      // Bundle the same code into two separate dist directories, one after the other.
      const secondDist = await tmp.dir({ unsafeCleanup: true })
      const secondDistPath = join(secondDist.path, '.netlify', 'edge-functions-dist')

      const bundleTarball = async (dist: string) => {
        await bundle([join(basePath, 'netlify/edge-functions')], dist, declarations, {
          basePath,
          configPath: join(basePath, '.netlify/edge-functions/config.json'),
        })

        const manifest = JSON.parse(await readFile(resolve(dist, 'manifest.json'), 'utf8'))

        return join(dist, manifest.bundles[0].asset)
      }

      const firstTarballPath = await bundleTarball(distPath)

      // Wait long enough to cross a whole-second boundary. tar stores mtime at
      // second resolution, so without the mtime-normalisation fix the second
      // bundle's freshly written files would carry a different mtime and the two
      // tarballs would diverge. With the fix, mtime is omitted and they match.
      await new Promise((done) => setTimeout(done, 1_500))

      const secondTarballPath = await bundleTarball(secondDistPath)

      const [firstTarball, secondTarball] = await Promise.all([readFile(firstTarballPath), readFile(secondTarballPath)])

      // The two tarballs must be byte-for-byte identical for reproducible builds.
      expect(firstTarball.equals(secondTarball)).toBe(true)

      await Promise.all([cleanup(), secondDist.cleanup()])
    })

    test('Using npm and remote modules', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('imports_npm_module', { copyDirectory: true })
      const sourceDirectory = join(basePath, 'functions')
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]
      const vendorDirectory = await tmp.dir()

      await bundle([sourceDirectory], distPath, declarations, {
        basePath,
        importMapPaths: [join(basePath, 'import_map.json')],
        vendorDirectory: vendorDirectory.path,
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      // The output includes process.cwd(), and the tarball runs in a temp directory.
      const expectedOutputPattern =
        '<parent-1><child-1>JavaScript</child-1></parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>'
      const expectedOutputSuffix =
        '</cwd></grandchild-1></child-2></parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>'
      const expectedOutputEnd = '</cwd></grandchild-1></child-2></parent-3>, TmV0bGlmeQ=='

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)

      // Extract tarball and verify vendored npm imports were rewritten
      const tmpDir = await tmp.dir({ unsafeCleanup: true, prefix: 'tarball-gen' })
      await tar.extract({ cwd: tmpDir.path, file: tarballPath })

      // Get the function path from the manifest
      const manifestContent = await readFile(join(tmpDir.path, '___netlify-edge-functions.json'), 'utf8')
      const tarballManifest = JSON.parse(manifestContent)
      const funcPath = tarballManifest.functions.func1

      const sourceContent = await readFile(join(tmpDir.path, funcPath), 'utf8')

      // Bare specifier "parent-1" should not be rewritten to a relative path
      expect(sourceContent).toContain("from 'parent-1'")

      await tmpDir.cleanup()

      const tarballResult = await runTarball(tarballPath)
      // Tarball runs in a temp directory, so cwd will be different
      expect(tarballResult.func1).toContain(expectedOutputPattern)
      expect(tarballResult.func1).toContain(expectedOutputSuffix)
      expect(tarballResult.func1).toContain(expectedOutputEnd)

      await cleanup()
      await rm(vendorDirectory.path, { force: true, recursive: true })
    })

    test('With imports from sibling directories', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('imports_sibling_directory', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: '{"appName":"test-app","itemCount":2}',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      // Verify that sibling directory files are included in the tarball
      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')
      expect(entries).toContain('./netlify/edge-functions/func1.ts')
      expect(entries).toContain('./data/config.json')
      expect(entries).toContain('./data/items.json')

      await cleanup()
    })

    test('Rewrites bare specifier imports to resolved URLs', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('bare_specifier_import', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'functions')], distPath, declarations, {
        basePath,
        importMapPaths: [join(basePath, 'import_map.json')],
        systemLogger,
      })

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)
      const tarballPath = join(distPath, manifest.bundles[0].asset)

      // Extract tarball and verify source file has been rewritten
      const tmpDir = await tmp.dir({ unsafeCleanup: true, prefix: 'tarball-gen' })
      await tar.extract({ cwd: tmpDir.path, file: tarballPath })

      const sourceContent = await readFile(join(tmpDir.path, 'func1.ts'), 'utf8')

      // The bare specifier "my-encoding" should NOT be rewritten to the resolved URL
      expect(sourceContent).toContain('from "my-encoding"')

      // The tarball should still execute correctly
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult.func1).toBe('TmV0bGlmeSBFZGdlIEZ1bmN0aW9ucw==')

      await tmpDir.cleanup()
      await cleanup()
    })

    test('Rewrites import assertions', async () => {
      const { basePath, cleanup, distPath } = await useFixture('with_import_assertions')
      const systemLogger = vi.fn()
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'functions')], distPath, declarations, {
        basePath,
        importMapPaths: [join(basePath, 'import_map.json')],
        systemLogger,
      })

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)
      const tarballPath = join(distPath, manifest.bundles[0].asset)

      // Extract tarball and verify source file has been rewritten
      const tmpDir = await tmp.dir({ unsafeCleanup: true, prefix: 'tarball-gen' })
      await tar.extract({ cwd: tmpDir.path, file: tarballPath })

      const sourceContent = await readFile(join(tmpDir.path, 'func1.ts'), 'utf8')

      // The bare specifier "my-encoding" should be rewritten to the resolved URL
      expect(sourceContent).toContain(`import dict from './dict.json' with { type: "json" }`)

      // The tarball should still execute correctly
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult.func1).toBe('{"foo":"bar"}')

      await tmpDir.cleanup()
      await cleanup()
    })

    test('Fails the build when tarball generation fails', async () => {
      vi.resetModules()
      vi.doMock('./formats/tarball.js', () => ({
        bundle: vi.fn().mockRejectedValue(new Error('Simulated tarball bundling failure')),
      }))

      const { bundle: bundleUnderTest } = await import('./bundler.js')

      const { basePath, cleanup, distPath } = await useFixture('imports_node_builtin', { copyDirectory: true })
      const sourceDirectory = join(basePath, 'netlify/edge-functions')
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      // The tarball is the only bundle we produce, so a failure to generate it
      // has nothing to fall back to and must surface as a build failure.
      await expect(
        bundleUnderTest([sourceDirectory], distPath, declarations, {
          basePath,
          configPath: join(basePath, '.netlify/edge-functions/config.json'),
        }),
      ).rejects.toThrowError('Simulated tarball bundling failure')

      await expect(access(resolve(distPath, 'manifest.json'))).rejects.toThrowError()

      await cleanup()
      vi.resetModules()
    })

    test('npm + http modules with import assertions', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('npm_and_http_import_with_import_assertions', {
        copyDirectory: true,
      })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'functions')], distPath, declarations, {
        basePath,
        configPath: join(basePath, 'functions/config.json'),
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: 'ok',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      expect(manifest.bundling_timing).toEqual({ tarball_ms: expect.any(Number) })

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      // Verify key files are present (vendor directory may contain additional files)
      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')

      await cleanup()
    })
    test('With @ prefixed local import filenames', async () => {
      const { basePath, cleanup, distPath } = await useFixture('imports_at_prefixed_files', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      // This should not throw ENOENT for the @ prefixed file.
      // Previously, node-tar would strip the '@' from filenames like
      // '@file_prefixed_with_the_at_symbol.ts', treating them as GNU tar archive-include directives,
      // causing a stat failure on the wrong path.
      await expect(
        bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
          basePath,
        }),
      ).resolves.not.toThrow()

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)
      const tarballPath = join(distPath, manifest.bundles[0].asset)

      // Verify the @ prefixed file is actually in the tarball
      const entries: string[] = []
      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })
      expect(entries.some((e) => e.includes('@file_prefixed_with_the_at_symbol.ts'))).toBe(true)

      // Verify the function actually runs correctly
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual({ func1: 'ok' })

      await cleanup()
    })

    test('Importing from root vendor directory is handled', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('imports_vendor', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        configPath: join(basePath, '.netlify/edge-functions/config.json'),
        importMapPaths: [resolve(basePath, 'import_map.json')],
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: 'hello hello',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      expect(manifest.bundling_timing).toEqual({ tarball_ms: expect.any(Number) })

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')
      expect(entries).toContain('./netlify/edge-functions/func1.ts')
      // vendor directory content was moved
      expect(entries).toContain('./.root-vendor/hello.ts')

      await cleanup()
    })

    test('Importing not existing module when caught is handled', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('caught-module-not-found-import', {
        copyDirectory: true,
      })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: 'ok',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      expect(manifest.bundling_timing).toEqual({ tarball_ms: expect.any(Number) })

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')
      expect(entries).toContain('./func1.ts')

      await cleanup()
    })

    test('Importing a directory when caught is handled', async () => {
      // Importing a directory is unsupported in Deno, but `deno info` still lists
      // the directory as an errored module reachable via a runtime (code) edge,
      // so it lands in the set of source files to bundle. Tarball generation used
      // to throw EISDIR when copying the directory; it must skip it instead.
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('caught-directory-import', {
        copyDirectory: true,
      })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        systemLogger,
      })

      const expectedOutput = {
        func1: 'ok',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []
      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      // The directory itself must not be present as an entry in the tarball.
      expect(entries).toContain('./func1.ts')
      expect(entries.some((entry) => entry === './models' || entry === './models/')).toBe(false)

      await cleanup()
    })

    test('Importing a remote module that imports a WebAssembly binary (deno_dom)', async () => {
      // Deno <2.6 vendors `.wasm` imports under a `.d.mts` extension even though
      // the content is the raw WASM binary. The rewriter must detect this by
      // magic bytes and copy the file through untouched instead of attempting
      // to parse it as UTF-8 source.
      const { basePath, cleanup, distPath } = await useFixture('imports_deno_dom_wasm', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]
      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
      })
      const expectedOutput = {
        func1: 'hello from deno_dom',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      const entries: string[] = []
      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      expect(entries).toContain('./___netlify-edge-functions.json')
      expect(entries).toContain('./deno.json')
      expect(entries).toContain('./func1.ts')

      // The vendored deno_dom WASM payload must be present in the tarball.
      // Deno <2.6 vendors `.wasm` imports under a `.d.mts` extension (with a
      // content-hash suffix); 2.6+ keeps the original `.wasm` extension.
      const denoDomVendorPrefix = './vendor/deno.land/x/deno_dom@v0.1.56/build/deno-wasm/'
      const expectedWasmEntry = lt(denoVersion, '2.6.0')
        ? `${denoDomVendorPrefix}#deno-wasm_bg.wasm_d2792.d.mts`
        : `${denoDomVendorPrefix}deno-wasm_bg.wasm`
      expect(entries).toContain(expectedWasmEntry)

      await cleanup()
    })

    test('With a type-only import from a directory', async () => {
      const systemLogger = vi.fn()
      const { basePath, cleanup, distPath } = await useFixture('import-types-directory', { copyDirectory: true })
      const declarations: Declaration[] = [
        {
          function: 'func1',
          path: '/func1',
        },
      ]

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = {
        func1: 'ok',
      }

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult).toStrictEqual(expectedOutput)

      await cleanup()
    })
  },
  50_000,
)
