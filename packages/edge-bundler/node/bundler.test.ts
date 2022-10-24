import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import process from 'process'
import { pathToFileURL } from 'url'

import { deleteAsync } from 'del'
import tmp from 'tmp-promise'
import { test, expect } from 'vitest'

import { fixturesDir } from '../test/util.js'

import { BundleError } from './bundle_error.js'
import { bundle, BundleOptions } from './bundler.js'

test('Produces a JavaScript bundle and a manifest file', async () => {
  const sourceDirectory = resolve(fixturesDir, 'with_import_maps', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    importMaps: [
      {
        baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
        imports: {
          'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
        },
      },
    ],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('js')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(result.manifest).toEqual(manifest)

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Produces only a ESZIP bundle when the `edge_functions_produce_eszip` feature flag is set', async () => {
  const sourceDirectory = resolve(fixturesDir, 'with_import_maps', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    featureFlags: {
      edge_functions_produce_eszip: true,
    },
    importMaps: [
      {
        baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
        imports: {
          'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
        },
      },
    ],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Uses the vendored eszip module instead of fetching it from deno.land', async () => {
  const sourceDirectory = resolve(fixturesDir, 'with_import_maps', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    featureFlags: {
      edge_functions_produce_eszip: true,
      edge_functions_use_vendored_eszip: true,
    },
    importMaps: [
      {
        baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
        imports: {
          'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
        },
      },
    ],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Adds a custom error property to user errors during bundling', async () => {
  expect.assertions(2)

  const sourceDirectory = resolve(fixturesDir, 'invalid_functions', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]

  try {
    await bundle([sourceDirectory], tmpDir.path, declarations)
  } catch (error) {
    expect(error).toBeInstanceOf(BundleError)
    expect((error as BundleError).customErrorInfo).toEqual({
      location: {
        format: 'javascript',
        runtime: 'deno',
      },
      type: 'functionsBundling',
    })
  }
})

test('Does not add a custom error property to system errors during bundling', async () => {
  expect.assertions(1)

  try {
    // @ts-expect-error Sending bad input to `bundle` to force a system error.
    await bundle([123, 321], tmpDir.path, declarations)
  } catch (error) {
    expect(error).not.toBeInstanceOf(BundleError)
  }
})

test('Uses the cache directory as the `DENO_DIR` value if the `edge_functions_cache_deno_dir` feature flag is set', async () => {
  expect.assertions(7)

  const sourceDirectory = resolve(fixturesDir, 'with_import_maps', 'functions')
  const outDir = await tmp.dir()
  const cacheDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const options: BundleOptions = {
    basePath: fixturesDir,
    cacheDirectory: cacheDir.path,
    importMaps: [
      {
        baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
        imports: {
          'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
        },
      },
    ],
  }

  // Run #1, feature flag off: The directory should not be populated.
  const result1 = await bundle([sourceDirectory], outDir.path, declarations, options)
  const outFiles1 = await fs.readdir(outDir.path)

  expect(result1.functions.length).toBe(1)
  expect(outFiles1.length).toBe(2)

  try {
    await fs.readdir(join(cacheDir.path, 'deno_dir'))
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
  }

  // Run #2, feature flag on: The directory should be populated.
  const result2 = await bundle([sourceDirectory], outDir.path, declarations, {
    ...options,
    featureFlags: {
      edge_functions_cache_deno_dir: true,
    },
  })
  const outFiles2 = await fs.readdir(outDir.path)

  expect(result2.functions.length).toBe(1)
  expect(outFiles2.length).toBe(2)

  const denoDir2 = await fs.readdir(join(cacheDir.path, 'deno_dir'))

  expect(denoDir2.includes('deps')).toBe(true)
  expect(denoDir2.includes('gen')).toBe(true)

  await fs.rmdir(outDir.path, { recursive: true })
})

test('Supports import maps with relative paths', async () => {
  const sourceDirectory = resolve(fixturesDir, 'with_import_maps', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    featureFlags: {
      edge_functions_produce_eszip: true,
    },
    importMaps: [
      {
        baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
        imports: {
          'alias:helper': './helper.ts',
        },
      },
    ],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(1)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Ignores any user-defined `deno.json` files', async () => {
  const fixtureDir = join(fixturesDir, 'with_import_maps')
  const tmpDir = await tmp.dir()
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
    // @ts-expect-error Error is not typed
    if (error.code !== 'ENOENT') {
      throw error
    }
  }

  await fs.writeFile(denoConfigPath, JSON.stringify(denoConfig))

  expect(() =>
    bundle([join(fixtureDir, 'functions')], tmpDir.path, declarations, {
      basePath: fixturesDir,
      featureFlags: {
        edge_functions_produce_eszip: true,
      },
      importMaps: [
        {
          baseURL: pathToFileURL(join(fixturesDir, 'import-map.json')),
          imports: {
            'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
          },
        },
      ],
    }),
  ).not.toThrow()

  await deleteAsync([tmpDir.path, denoConfigPath, importMapFile.path], { force: true })
})
