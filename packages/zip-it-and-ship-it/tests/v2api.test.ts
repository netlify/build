import { readFile } from 'fs/promises'
import { join, resolve } from 'path'
import { platform } from 'process'

import { getPath as getBootstrapPath } from '@netlify/serverless-functions-api'
import merge from 'deepmerge'
import { pathExists } from 'path-exists'
import { glob } from 'tinyglobby'
import { dir as getTmpDir } from 'tmp-promise'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { ARCHIVE_FORMAT } from '../src/archive.js'
import { DEFAULT_NODE_VERSION } from '../src/runtimes/node/utils/node_version.js'

import { invokeLambda, readAsBuffer } from './helpers/lambda.js'
import { zipFixture, unzipFiles, importFunctionFile, FIXTURES_ESM_DIR, FIXTURES_DIR } from './helpers/main.js'
import { testMany } from './helpers/test_many.js'

vi.mock('../src/utils/shell.js', () => ({ shellUtils: { runCommand: vi.fn() } }))

describe('V2 functions API', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  testMany(
    'Handles a basic JavaScript function',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files } = await zipFixture('v2-api', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: options,
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('esm')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)
      }

      const unzippedFunctions = await unzipFiles(files)

      const func = await importFunctionFile(`${unzippedFunctions[0].unzipPath}/${files[0].entryFilename}`)
      const { body: bodyStream, multiValueHeaders = {}, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(body).toBe('<h1>Hello world</h1>')
      expect(multiValueHeaders['content-type']).toEqual(['text/html'])
      expect(statusCode).toBe(200)
    },
  )

  testMany(
    'Handles a .mjs function',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files } = await zipFixture('v2-api-mjs', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: options,
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('esm')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)
      }

      const unzippedFunctions = await unzipFiles(files)

      const func = await importFunctionFile(`${unzippedFunctions[0].unzipPath}/${files[0].entryFilename}`)
      const { body: bodyStream, multiValueHeaders = {}, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(body).toBe('<h1>Hello world</h1>')
      expect(multiValueHeaders['content-type']).toEqual(['text/html'])
      expect(statusCode).toBe(200)
    },
  )

  testMany(
    'Handles a basic JavaScript function with archiveFormat set to `none`',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files, tmpDir } = await zipFixture('v2-api', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
        }),
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('esm')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)
      }

      const [{ name: archive, entryFilename }] = files
      const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
      const { body: bodyStream, multiValueHeaders = {}, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(body).toBe('<h1>Hello world</h1>')
      expect(multiValueHeaders['content-type']).toEqual(['text/html'])
      expect(statusCode).toBe(200)
    },
  )

  testMany(
    'Handles a basic TypeScript function',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files, tmpDir } = await zipFixture('v2-api-ts', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
        }),
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('cjs')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)
      }

      const [{ name: archive, entryFilename, path }] = files

      const untranspiledFiles = await glob(`${path}/**/*.ts`, { expandDirectories: false })
      expect(untranspiledFiles).toEqual([])

      const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
      const { body: bodyStream, multiValueHeaders = {}, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(body).toBe('<h1>Hello world from Typescript</h1>')
      expect(multiValueHeaders['content-type']).toEqual(['text/html'])
      expect(statusCode).toBe(200)
    },
  )

  testMany(
    'Handles an ESM function that imports both CJS and ESM modules',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const fixtureName = 'v2-api-esm-mixed-modules'
      const { files, tmpDir } = await zipFixture(fixtureName, {
        length: 2,
        fixtureDir: FIXTURES_ESM_DIR,
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
        }),
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('esm')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)

        const expectedInputs = [
          'package.json',
          entry.name === 'function-js' ? 'function-js.js' : 'function-ts.ts',
          'node_modules/cjs-module/package.json',
          'node_modules/cjs-module/index.js',
          'node_modules/esm-module/package.json',
          'node_modules/esm-module/index.js',
          'node_modules/esm-module/foo.js',
          'node_modules/cjs-module/foo.js',
          'lib/helper1.ts',
          'lib/helper2.ts',
          'lib/helper3.ts',
          'lib/helper4.js',
          'lib/helper5.mjs',
          'lib/helper6.js',
        ]
          .map((relativePath) => resolve(FIXTURES_ESM_DIR, fixtureName, relativePath))
          .sort()

        expect(entry.inputs?.sort()).toEqual(expectedInputs)

        const [{ name: archive, entryFilename }] = files

        const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
        const { body: bodyStream, statusCode } = await invokeLambda(func)
        const body = await readAsBuffer(bodyStream)

        expect(JSON.parse(body)).toEqual({
          cjs: { foo: '🌭', type: 'cjs' },
          esm: { foo: '🌭', type: 'esm' },
          helper1: 'helper1',
          helper2: 'helper2',
          helper3: 'helper3',
          helper4: 'helper4',
          helper5: 'helper5',
        })
        expect(statusCode).toBe(200)
      }
    },
  )

  testMany(
    'Handles a CJS function that imports CJS and ESM modules',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const fixtureName = 'v2-api-cjs-modules'
      const { files, tmpDir } = await zipFixture(fixtureName, {
        length: 2,
        fixtureDir: FIXTURES_ESM_DIR,
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
        }),
      })

      for (const entry of files) {
        expect(entry.bundler).toBe('nft')
        expect(entry.outputModuleFormat).toBe('cjs')
        expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
        expect(entry.runtimeAPIVersion).toBe(2)

        const expectedInputs = [
          'package.json',
          entry.name === 'function-ts' ? 'function-ts.ts' : 'function-js.js',
          'node_modules/cjs-module/package.json',
          'node_modules/cjs-module/index.js',
          'node_modules/esm-module/package.json',
          'node_modules/esm-module/index.js',
          'node_modules/esm-module/foo.js',
          'node_modules/cjs-module/foo.js',
          'lib/helper1.ts',
          'lib/helper2.ts',
          'lib/helper3.ts',
          'lib/helper4.js',
          'lib/helper5.mjs',
        ]
          .map((relativePath) => resolve(FIXTURES_ESM_DIR, fixtureName, relativePath))
          .sort()

        expect(entry.inputs?.sort()).toEqual(expectedInputs)

        const [{ name: archive, entryFilename }] = files

        const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
        const { body: bodyStream, statusCode } = await invokeLambda(func)
        const body = await readAsBuffer(bodyStream)

        expect(JSON.parse(body)).toEqual({
          cjs: { foo: '🌭', type: 'cjs' },
          esm: { foo: '🌭', type: 'esm' },
          helper1: 'helper1',
          helper2: 'helper2',
          helper3: 'helper3',
          helper4: 'helper4',
          helper5: 'helper5',
        })
        expect(statusCode).toBe(200)
      }
    },
  )

  testMany('Handles a CJS TypeScript function that uses path aliases', ['bundler_default'], async (options) => {
    const { files, tmpDir } = await zipFixture('v2-api-cjs-ts-aliases', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: merge(options, {
        archiveFormat: ARCHIVE_FORMAT.NONE,
      }),
    })

    for (const entry of files) {
      expect(entry.bundler).toBe('nft')
      expect(entry.outputModuleFormat).toBe('cjs')
      expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
      expect(entry.runtimeAPIVersion).toBe(2)
    }

    const [{ name: archive, entryFilename }] = files

    const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
    const { body: bodyStream, statusCode } = await invokeLambda(func)
    const body = await readAsBuffer(bodyStream)

    expect(JSON.parse(body)).toEqual({
      cjs: { foo: '🌭', type: 'cjs' },
      esm: { foo: '🌭', type: 'esm' },
      helper1: 'helper1',
      helper2: 'helper2',
      helper3: 'helper3',
      helper4: 'helper4',
      helper5: 'helper5',
    })
    expect(statusCode).toBe(200)
  })

  testMany('Handles an ESM TypeScript function that uses path aliases', ['bundler_default'], async (options) => {
    const { files, tmpDir } = await zipFixture('v2-api-esm-ts-aliases', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: merge(options, {
        archiveFormat: ARCHIVE_FORMAT.NONE,
      }),
    })

    for (const entry of files) {
      expect(entry.bundler).toBe('nft')
      expect(entry.outputModuleFormat).toBe('esm')
      expect(entry.entryFilename).toBe('___netlify-entry-point.mjs')
      expect(entry.runtimeAPIVersion).toBe(2)
    }

    const [{ name: archive, entryFilename }] = files

    const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
    const { body: bodyStream, statusCode } = await invokeLambda(func)
    const body = await readAsBuffer(bodyStream)

    expect(JSON.parse(body)).toEqual({
      cjs: { foo: '🌭', type: 'cjs' },
      esm: { foo: '🌭', type: 'esm' },
      helper1: 'helper1',
      helper2: 'helper2',
      helper3: 'helper3',
      helper4: 'helper4',
      helper5: 'helper5',
    })
    expect(statusCode).toBe(200)
  })

  test('Returns Node.js 18 if older version is set', async () => {
    const { files } = await zipFixture('v2-api-mjs', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: {
        config: {
          '*': {
            nodeVersion: '16.0.0',
          },
        },
      },
    })

    expect(files[0].runtimeVersion).toBe('nodejs22.x')
  })

  test('Returns Node.js 18 if invalid version is set', async () => {
    const { files } = await zipFixture('v2-api-mjs', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: {
        config: {
          '*': {
            nodeVersion: 'invalid',
          },
        },
      },
    })

    expect(files[0].runtimeVersion).toBe('nodejs22.x')
  })

  test('Returns no Node.js version if version is newer than 18 but not a valid runtime', async () => {
    const { files } = await zipFixture('v2-api-mjs', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: {
        config: {
          '*': {
            nodeVersion: '19.0.0',
          },
        },
      },
    })

    expect(files[0].runtimeVersion).toBeUndefined()
  })

  test('Does not log to systemlog for v1', async () => {
    const systemLog = vi.fn()

    await zipFixture('simple', {
      opts: {
        systemLog,
      },
    })

    expect(systemLog).not.toHaveBeenCalled()
  })

  test('Extracts routes and excluded routes from the `path` and `excludedPath` properties', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const manifestPath = join(tmpDir, 'manifest.json')

    const { files } = await zipFixture('v2-api-with-path', {
      fixtureDir: FIXTURES_ESM_DIR,
      length: 6,
      opts: {
        manifest: manifestPath,
      },
    })

    const expectedRoutes = {
      'with-literal': { routes: [{ pattern: '/products', literal: '/products', methods: ['GET', 'POST'] }] },
      'with-named-group': {
        routes: [
          {
            pattern: '/products/:id',
            expression: '^\\/products(?:\\/([^\\/]+?))\\/?$',
            methods: [],
          },
        ],
      },
      'with-regex': {
        routes: [
          {
            pattern: '/numbers/(\\d+)',
            expression: '^\\/numbers(?:\\/(\\d+))\\/?$',
            methods: [],
          },
        ],
      },
      'with-excluded-literal': {
        routes: [
          {
            pattern: '/products/:id',
            expression: '^\\/products(?:\\/([^\\/]+?))\\/?$',
            methods: ['GET', 'POST'],
          },
        ],
        excludedRoutes: [
          {
            pattern: '/products/jacket',
            literal: '/products/jacket',
          },
        ],
      },
      'with-excluded-expression': {
        routes: [
          {
            pattern: '/products/:id',
            expression: '^\\/products(?:\\/([^\\/]+?))\\/?$',
            methods: [],
          },
        ],
        excludedRoutes: [
          {
            pattern: '/products/sale*',
            expression: '^\\/products\\/sale(.*)\\/?$',
          },
        ],
      },
      'with-excluded-mixed': {
        routes: [
          {
            pattern: '/products/:id',
            expression: '^\\/products(?:\\/([^\\/]+?))\\/?$',
            methods: [],
          },
        ],
        excludedRoutes: [
          {
            pattern: '/products/sale*',
            expression: '^\\/products\\/sale(.*)\\/?$',
          },
          {
            pattern: '/products/jacket',
            literal: '/products/jacket',
          },
        ],
      },
    }

    for (const name in expectedRoutes) {
      expect(files.some((file) => file.name === name)).toBeTruthy()
    }

    for (const file of files) {
      expect(file.routes).toEqual(expectedRoutes[file.name].routes)

      if (expectedRoutes[file.name].excludedRoutes) {
        expect(file.excludedRoutes).toEqual(expectedRoutes[file.name].excludedRoutes)
      } else {
        expect(file.excludedRoutes).toEqual([])
      }
    }

    const manifestString = await readFile(manifestPath, { encoding: 'utf8' })
    const manifest = JSON.parse(manifestString)

    for (const entry of manifest.functions) {
      const match = Object.keys(expectedRoutes).find((key) => key === entry.name)
      expect(match).not.toBeUndefined()

      const expected = expectedRoutes[match!]

      expect(entry.routes).toEqual(expected.routes)
      expect(entry.buildData.runtimeAPIVersion).toEqual(2)

      if (expected.excludedRoutes) {
        expect(entry.excludedRoutes).toEqual(expected.excludedRoutes)
      } else {
        expect(entry.excludedRoutes).toBeUndefined()
      }
    }
  })

  test('Flags invalid values of the `path` in-source configuration property as user errors', async () => {
    expect.assertions(3)

    try {
      await zipFixture('v2-api-with-invalid-path', {
        fixtureDir: FIXTURES_ESM_DIR,
      })
    } catch (error) {
      const { customErrorInfo } = error

      expect(customErrorInfo.type).toBe('functionsBundling')
      expect(customErrorInfo.location.functionName).toBe('function')
      expect(customErrorInfo.location.runtime).toBe('js')
    }
  })

  testMany(
    'Retrieves the process environment through the Netlify.env helper',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files, tmpDir } = await zipFixture('v2-api-environment-variables', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
        }),
      })

      vi.stubEnv('foo', 'foo!')
      vi.stubEnv('baz', 'baz!')

      const [{ name: archive, entryFilename }] = files
      const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
      const { body: bodyStream, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      const parsed = JSON.parse(body)

      expect(parsed).toMatchObject({
        text: 'Foo bar!',
        foo: true,
        env: expect.objectContaining({
          foo: 'foo!',
        }),
        baz: 'baz!',
      })
      // bar got set and deleted again
      expect(parsed).not.toHaveProperty('bar')
      expect(statusCode).toBe(200)
    },
  )

  describe('Handles an ESM module installed with pnpm', () => {
    test('With `archiveFormat: none`', async (options) => {
      const fixtureName = 'pnpm-esm-v2'
      const { files, tmpDir } = await zipFixture(join(fixtureName, 'netlify', 'functions'), {
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.NONE,
          basePath: join(FIXTURES_DIR, fixtureName),
        }),
      })

      const [{ name: archive, entryFilename }] = files
      const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
      const { body: bodyStream, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(statusCode).toBe(200)
      expect(body).toBe('foo!bar')
    })

    // TODO: Investigate why this is failing on Windows.
    test.skipIf(platform === 'win32')('With `archiveFormat: zip`', async (options) => {
      const fixtureName = 'pnpm-esm-v2'
      const { files } = await zipFixture(join(fixtureName, 'netlify', 'functions'), {
        opts: merge(options, {
          archiveFormat: ARCHIVE_FORMAT.ZIP,
          basePath: join(FIXTURES_DIR, fixtureName),
        }),
      })

      const unzippedFunctions = await unzipFiles(files)

      const func = await importFunctionFile(`${unzippedFunctions[0].unzipPath}/${files[0].entryFilename}`)
      const { body: bodyStream, statusCode } = await invokeLambda(func)
      const body = await readAsBuffer(bodyStream)

      expect(statusCode).toBe(200)
      expect(body).toBe('foo!bar')
    })
  })

  test('Name, Generator and Timeout are taken from ISC and take precedence over deploy config', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const manifestPath = join(tmpDir, 'manifest.json')

    const fixtureName = 'v2-api-name-generator'
    const pathInternal = join(fixtureName, '.netlify', 'functions-internal')

    const {
      files: [func],
    } = await zipFixture(pathInternal, {
      fixtureDir: FIXTURES_ESM_DIR,
      length: 1,
      opts: {
        manifest: manifestPath,
        configFileDirectories: [join(FIXTURES_ESM_DIR, fixtureName)],
      },
    })

    expect(func.displayName).toBe('SSR Function')
    expect(func.timeout).toBe(60)
    expect(func.generator).toBe('next-runtime@1.2.3')

    const manifestString = await readFile(manifestPath, { encoding: 'utf8' })
    const manifest = JSON.parse(manifestString)
    expect(manifest.functions).toHaveLength(1)
    expect(manifest.functions[0].timeout).toEqual(60)
    expect(manifest.functions[0].displayName).toEqual('SSR Function')
    expect(manifest.functions[0].generator).toEqual('next-runtime@1.2.3')
  })

  testMany(
    'Bootstrap is imported before user code so it can apply side-effects before the user code runs',
    ['bundler_default', 'bundler_esbuild', 'bundler_esbuild_zisi', 'bundler_default_nft', 'bundler_nft'],
    async (options) => {
      const { files } = await zipFixture('v2-api', {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: options,
      })

      const unzippedFunctions = await unzipFiles(files)

      const contents = await readFile(join(unzippedFunctions[0].unzipPath, files[0].entryFilename), {
        encoding: 'utf-8',
      })
      const positionOfBootstrapImport = contents.indexOf('___netlify-bootstrap.mjs')
      const positionOfUserCodeImport = contents.indexOf('function.mjs')

      expect(positionOfBootstrapImport).toBeGreaterThan(0)
      expect(positionOfUserCodeImport).toBeGreaterThan(0)
      expect(positionOfBootstrapImport).toBeLessThan(positionOfUserCodeImport)
    },
  )

  test('Includes in the bundle files included in the function source', async () => {
    const fixtureName = 'v2-api-included-files'
    const { files, tmpDir } = await zipFixture(`${fixtureName}/netlify/functions`, {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: {
        archiveFormat: ARCHIVE_FORMAT.NONE,
        basePath: resolve(FIXTURES_ESM_DIR, fixtureName),
        config: {
          '*': {
            includedFiles: ['blog/author*'],
          },
        },
      },
    })

    const [{ name: archive, entryFilename, includedFiles, runtimeAPIVersion }] = files
    const func = await importFunctionFile(`${tmpDir}/${archive}/${entryFilename}`)
    const { body: bodyStream, multiValueHeaders = {}, statusCode } = await invokeLambda(func)
    const body = await readAsBuffer(bodyStream)

    expect(body).toBe('<h1>Hello world</h1>')
    expect(multiValueHeaders['content-type']).toEqual(['text/html'])
    expect(statusCode).toBe(200)
    expect(runtimeAPIVersion).toBe(2)
    expect(includedFiles).toEqual([
      resolve(FIXTURES_ESM_DIR, fixtureName, 'blog/post1.md'),
      resolve(FIXTURES_ESM_DIR, fixtureName, 'blog/post2.md'),
    ])

    for (const path of includedFiles as string[]) {
      expect(await pathExists(path)).toBeTruthy()
    }
  })

  test('Uses the bundler specified in the `nodeBundler` property from the in-source configuration', async () => {
    const fixtureName = 'v2-api-bundler-none'
    const { files } = await zipFixture(fixtureName, {
      fixtureDir: FIXTURES_ESM_DIR,
    })

    const unzippedFunctions = await unzipFiles(files)
    const originalFile = await readFile(join(FIXTURES_ESM_DIR, fixtureName, 'function.js'), 'utf8')
    const bundledFile = await readFile(join(unzippedFunctions[0].unzipPath, 'function.js'), 'utf8')

    expect(originalFile).toBe(bundledFile)
  })

  test('Uses the Node.js version specified in the `nodeVersion` property from the in-source configuration', async () => {
    const fixtureName = 'v2-api-node-version'
    const { files } = await zipFixture(fixtureName, {
      fixtureDir: FIXTURES_ESM_DIR,
    })

    expect(
      `nodejs${DEFAULT_NODE_VERSION}.x`,
      'The Node.js version extracted from the function is the same as the default version, which defeats the point of the assertion. If you have updated the default Node.js version, please update the fixture to use a different version.',
    ).not.toBe(files[0].runtimeVersion)
    expect(files[0].config.nodeVersion).toBe('20')
    expect(files[0].runtimeVersion).toBe('nodejs20.x')
  })

  describe('Adds a file with metadata', () => {
    test('Without a branch', async () => {
      const fixtureName = 'v2-api'
      const { files } = await zipFixture(fixtureName, {
        fixtureDir: FIXTURES_ESM_DIR,
      })
      const [unzippedFunction] = await unzipFiles(files)
      const bootstrapPath = getBootstrapPath()
      const bootstrapPackageJson = await readFile(resolve(bootstrapPath, '..', '..', 'package.json'), 'utf8')
      const { version: bootstrapVersion } = JSON.parse(bootstrapPackageJson)
      const versionFileContents = await readFile(join(unzippedFunction.unzipPath, '___netlify-metadata.json'), 'utf8')

      expect(JSON.parse(versionFileContents)).toEqual({ bootstrap_version: bootstrapVersion, version: 1 })
    })

    test('With a branch', async () => {
      const fixtureName = 'v2-api'
      const { files } = await zipFixture(fixtureName, {
        fixtureDir: FIXTURES_ESM_DIR,
        opts: {
          branch: 'main',
        },
      })
      const [unzippedFunction] = await unzipFiles(files)
      const bootstrapPath = getBootstrapPath()
      const bootstrapPackageJson = await readFile(resolve(bootstrapPath, '..', '..', 'package.json'), 'utf8')
      const { version: bootstrapVersion } = JSON.parse(bootstrapPackageJson)
      const versionFileContents = await readFile(join(unzippedFunction.unzipPath, '___netlify-metadata.json'), 'utf8')

      expect(JSON.parse(versionFileContents)).toEqual({
        bootstrap_version: bootstrapVersion,
        branch: 'main',
        version: 1,
      })
    })
  })

  test('Adds a `buildData` object to each function entry in the manifest file', async () => {
    const bootstrapPath = getBootstrapPath()
    const bootstrapPackageJson = await readFile(resolve(bootstrapPath, '..', '..', 'package.json'), 'utf8')
    const { version: bootstrapVersion } = JSON.parse(bootstrapPackageJson)

    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test' })
    const manifestPath = join(tmpDir, 'manifest.json')

    const { files } = await zipFixture('v2-api', {
      fixtureDir: FIXTURES_ESM_DIR,
      opts: {
        manifest: manifestPath,
      },
    })

    expect(files.length).toBe(1)
    expect(files[0].name).toBe('function')
    expect(files[0].bootstrapVersion).toBe(bootstrapVersion)
    expect(files[0].runtimeAPIVersion).toBe(2)

    const manifestString = await readFile(manifestPath, { encoding: 'utf8' })
    const manifest = JSON.parse(manifestString)

    expect(manifest.functions.length).toBe(1)
    expect(manifest.functions[0].name).toBe('function')
    expect(manifest.functions[0].buildData).toEqual({ bootstrapVersion, runtimeAPIVersion: 2 })
  })
})
