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
import { denoVersion, runESZIP, runTarball, useFixture } from '../test/util.js'

import { BundleError } from './bundle_error.js'
import { bundle, BundleOptions } from './bundler.js'
import { Declaration } from './declaration.js'
import { isFileNotFoundError } from './utils/error.js'
import { validateManifest } from './validation/manifest/index.js'

test('Produces an ESZIP bundle', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
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
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(importMapURL).toBe(importMapSpecifier)

  const bundlePath = join(distPath, bundles[0].asset)
  const { func1, func2, func3 } = await runESZIP(bundlePath)

  expect(func1).toBe('HELLO, JANE DOE!')
  expect(func2).toBe('Jane Doe')
  expect(func3).toBe('hello, netlify!')

  await cleanup()
})

test('Uses the vendored eszip module instead of fetching it from deno.land', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const sourceDirectory = join(basePath, 'functions')
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
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await cleanup()
})

test('Adds a custom error property to user errors during bundling', async () => {
  process.env.NO_COLOR = 'true'
  expect.assertions(3)

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
    const messageBeforeStack = (error as BundleError).message
    expect(
      messageBeforeStack
        .replace(/file:\/\/\/(.*?\/)(build\/packages\/edge-bundler\/deno\/vendor\/deno\.land\/x\/eszip.*)/, 'file://$2')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''),
    ).toMatchSnapshot()
    expect((error as BundleError).customErrorInfo).toEqual({
      location: {
        format: 'eszip',
        runtime: 'deno',
      },
      type: 'functionsBundling',
    })
  } finally {
    await cleanup()
  }
})

test('Prints a nice error message when user tries importing an npm module', async () => {
  expect.assertions(2)

  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module_scheme')
  const sourceDirectory = join(basePath, 'functions')
  const declarations: Declaration[] = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], distPath, declarations, {
      basePath,
    })
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
    expect((error as BundleError).message).toEqual(
      `There was an error when loading the 'p-retry' npm module. Support for npm modules in edge functions is an experimental feature. Refer to https://ntl.fyi/edge-functions-npm for more information.`,
    )
  } finally {
    await cleanup()
  }
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
  expect(bundles[0].format).toBe('eszip2')
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
  expect(bundles[0].format).toBe('eszip2')
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
  expect(bundles[0].format).toBe('eszip2')
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
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(importMapURL).toBe(importMapSpecifier)
  expect(routes.length).toBe(1)
  expect(routes[0].function).toBe('func1')
  expect(routes[0].pattern).toBe('^/func1/?$')

  const bundlePath = join(distPath, bundles[0].asset)

  const { func1 } = await runESZIP(bundlePath)

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
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(importMapURL).toBe(importMapSpecifier)
  expect(routes.length).toBe(1)
  expect(routes[0].function).toBe('func1')
  expect(routes[0].pattern).toBe('^/func1/?$')

  const bundlePath = join(distPath, bundles[0].asset)

  const { func1 } = await runESZIP(bundlePath)

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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

  expect(func1).toBe(
    `<parent-1><child-1>JavaScript</child-1></parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-3>, TmV0bGlmeQ==`,
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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

  expect(func1).toBe(
    `<parent-1><child-1>JavaScript</child-1></parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-3>`,
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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

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
  const { func1 } = await runESZIP(bundlePath, vendorDirectory.path)

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
  expect(bundles[0].format).toBe('eszip2')
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

describe.skipIf(lt(denoVersion, '2.4.3'))(
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
      const vendorDirectory = await tmp.dir()

      await bundle([join(basePath, 'netlify/edge-functions')], distPath, declarations, {
        basePath,
        configPath: join(basePath, '.netlify/edge-functions/config.json'),
        featureFlags: {
          edge_bundler_generate_tarball: true,
        },
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

      const entries: string[] = []

      await tar.list({
        file: tarballPath,
        onReadEntry: (entry) => {
          entries.push(entry.path)
        },
      })

      expect(entries).toStrictEqual(['___netlify-edge-functions.json', 'deno.json', 'func1.js'])

      const eszipPath = join(distPath, manifest.bundles[1].asset)
      const eszipResult = await runESZIP(eszipPath)
      expect(eszipResult).toStrictEqual(expectedOutput)

      await cleanup()
      await rm(vendorDirectory.path, { force: true, recursive: true })
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
        featureFlags: {
          edge_bundler_generate_tarball: true,
        },
        importMapPaths: [join(basePath, 'import_map.json')],
        vendorDirectory: vendorDirectory.path,
        systemLogger,
      })

      expect(
        systemLogger.mock.calls.find((call) => call[0] === 'Could not track dependencies in edge function:'),
      ).toBeUndefined()

      const expectedOutput = `<parent-1><child-1>JavaScript</child-1></parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-3>, TmV0bGlmeQ==`

      const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
      const manifest = JSON.parse(manifestFile)

      const tarballPath = join(distPath, manifest.bundles[0].asset)
      const tarballResult = await runTarball(tarballPath)
      expect(tarballResult.func1).toBe(expectedOutput)

      const eszipPath = join(distPath, manifest.bundles[1].asset)
      const eszipResult = await runESZIP(eszipPath, vendorDirectory.path)
      expect(eszipResult.func1).toBe(expectedOutput)

      await cleanup()
      await rm(vendorDirectory.path, { force: true, recursive: true })
    })

    describe('Dry-run tarball generation flag enabled', () => {
      test('Logs success message when tarball generation succeeded', async () => {
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
          featureFlags: {
            edge_bundler_dry_run_generate_tarball: true,
            edge_bundler_generate_tarball: false,
          },
          systemLogger,
        })

        expect(systemLogger).toHaveBeenCalledWith('Dry run: Tarball bundle generated successfully.')

        const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
        const manifest = JSON.parse(manifestFile)

        expect(manifest.bundles.length).toBe(1)
        expect(manifest.bundles[0].format).toBe('eszip2')

        await cleanup()
      })

      test('Logs error message when tarball generation failed and does not fail the overall build', async () => {
        const systemLogger = vi.fn()
        vi.resetModules()
        vi.doMock('./formats/tarball.js', () => ({
          bundle: vi.fn().mockRejectedValue(new Error('Simulated tarball bundling failure')),
        }))

        const { bundle: bundleUnderTest } = await import('./bundler.js')

        const { basePath, cleanup, distPath } = await useFixture('imports_node_builtin', { copyDirectory: true })
        const sourceDirectory = join(basePath, 'functions')
        const declarations: Declaration[] = [
          {
            function: 'func1',
            path: '/func1',
          },
        ]

        await expect(
          bundleUnderTest([sourceDirectory], distPath, declarations, {
            basePath,
            configPath: join(sourceDirectory, 'config.json'),
            featureFlags: {
              edge_bundler_dry_run_generate_tarball: true,
              edge_bundler_generate_tarball: false,
            },
            systemLogger,
          }),
        ).resolves.toBeDefined()

        expect(systemLogger).toHaveBeenCalledWith(
          `Dry run: Tarball bundle generation failed: Simulated tarball bundling failure`,
        )

        const manifestFile = await readFile(resolve(distPath, 'manifest.json'), 'utf8')
        const manifest = JSON.parse(manifestFile)
        expect(manifest.bundles.length).toBe(1)
        expect(manifest.bundles[0].format).toBe('eszip2')

        await cleanup()
        vi.resetModules()
      })
    })
  },
  10_000,
)
