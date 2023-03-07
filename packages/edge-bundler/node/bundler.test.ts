import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import process from 'process'
import { pathToFileURL } from 'url'

import { deleteAsync } from 'del'
import tmp from 'tmp-promise'
import { test, expect, vi } from 'vitest'

import { importMapSpecifier } from '../shared/consts.js'
import { runESZIP, useFixture } from '../test/util.js'

import { BundleError } from './bundle_error.js'
import { bundle, BundleOptions } from './bundler.js'
import { isFileNotFoundError } from './utils/error.js'
import { validateManifest } from './validation/manifest/index.js'

test('Produces an ESZIP bundle', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const declarations = [
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
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(3)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
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
  const declarations = [
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
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await cleanup()
})

test('Adds a custom error property to user errors during bundling', async () => {
  expect.assertions(2)

  const { basePath, cleanup, distPath } = await useFixture('invalid_functions')
  const sourceDirectory = join(basePath, 'functions')
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], distPath, declarations, { basePath })
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
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

test('Prints a nice error message when user tries importing NPM module', async () => {
  expect.assertions(2)

  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module')
  const sourceDirectory = join(basePath, 'functions')
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], distPath, declarations, { basePath })
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
    expect((error as BundleError).message).toEqual(
      `It seems like you're trying to import an npm module. This is only supported via CDNs like esm.sh. Have you tried 'import mod from "https://esm.sh/p-retry"'?`,
    )
  } finally {
    await cleanup()
  }
})

test('Prints a nice error message when user tries importing NPM module with npm: scheme', async () => {
  expect.assertions(2)

  const { basePath, cleanup, distPath } = await useFixture('imports_npm_module_scheme')
  const sourceDirectory = join(basePath, 'functions')
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], distPath, declarations, { basePath })
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
    expect((error as BundleError).message).toEqual(
      `It seems like you're trying to import an npm module. This is only supported via CDNs like esm.sh. Have you tried 'import mod from "https://esm.sh/p-retry"'?`,
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
  const declarations = [
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
  const outFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(outFiles.length).toBe(2)

  const denoDir = await fs.readdir(join(cacheDir.path, 'deno_dir'))

  expect(denoDir.includes('gen')).toBe(true)

  await cleanup()
})

test('Supports import maps with relative paths', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_import_maps')
  const sourceDirectory = join(basePath, 'functions')
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], distPath, declarations, {
    basePath,
    configPath: join(sourceDirectory, 'config.json'),
  })
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
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
  const declarations = [
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

  await fs.writeFile(importMapFile.path, JSON.stringify(importMap))

  // Deno configuration files need to be in the current working directory.
  // There's not a great way for us to set the working directory of the `deno`
  // process that we'll run, so our best bet is to write the file to whatever
  // is the current working directory now and then clean it up.
  const denoConfigPath = join(process.cwd(), 'deno.json')
  const denoConfig = {
    importMap: importMapFile.path,
  }

  try {
    await fs.access(denoConfigPath)

    throw new Error(
      `The file at '${denoConfigPath} would be overwritten by this test. Please move the file to a different location and try again.'`,
    )
  } catch (error) {
    if (!isFileNotFoundError(error)) {
      throw error
    }
  }

  await fs.writeFile(denoConfigPath, JSON.stringify(denoConfig))

  expect(() =>
    bundle([sourceDirectory], distPath, declarations, {
      basePath,
      configPath: join(sourceDirectory, 'config.json'),
    }),
  ).not.toThrow()

  await cleanup()
  await deleteAsync([denoConfigPath, importMapFile.path], { force: true })
})

test('Processes a function that imports a custom layer', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_layers')
  const sourceDirectory = join(basePath, 'functions')
  const declarations = [
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
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, layers } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(layers).toEqual([layer])

  await cleanup()
})

test('Loads declarations and import maps from the deploy configuration', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_deploy_config')
  const declarations = [
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
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(3)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { routes, bundles, function_config: functionConfig } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(routes[0].generator).toBeUndefined()
  expect(routes[1].name).toBe('Function two')
  expect(routes[1].generator).toBe('@netlify/fake-plugin@1.0.0')
  expect(routes[2].generator).toBe('internalFunc')

  // respects excludedPath from deploy config
  expect(functionConfig.func2).toEqual({ excluded_patterns: ['^/func2/skip/?$'] })

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

  await fs.writeFile(importMap.path, JSON.stringify(importMapContents))

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
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions.length).toBe(2)
  expect(generatedFiles.length).toBe(2)
  expect(systemLogger).toHaveBeenCalledWith(`Did not find an import map file at '${nonExistingImportMapPath}'.`)

  await cleanup()
  await importMap.cleanup()
})
