import { join } from 'path'

import { describe, expect, test } from 'vitest'

import { listFunctions } from '../src/main.js'

import { FIXTURES_DIR, FIXTURES_ESM_DIR, normalizeFiles } from './helpers/main.js'

describe('listFunctions', () => {
  describe('v1', () => {
    test('Can list function main files with listFunctions()', async () => {
      const fixtureDir = `${FIXTURES_DIR}/list`
      const functions = await listFunctions(fixtureDir)

      expect(functions.map((file) => normalizeFiles(fixtureDir, file))).toMatchSnapshot()
    })

    test('Can list function main files from multiple source directories with listFunctions()', async () => {
      const fixtureDir = `${FIXTURES_DIR}/multiple-src-directories`
      const functions = await listFunctions([
        join(fixtureDir, '.netlify', 'internal-functions'),
        join(fixtureDir, 'netlify', 'functions'),
      ])

      expect(functions.map((file) => normalizeFiles(fixtureDir, file))).toMatchSnapshot()
    })

    test('listFunctions surfaces schedule config property', async () => {
      const functions = await listFunctions(join(FIXTURES_DIR, 'many-functions'), {
        config: {
          five: {
            schedule: '@daily',
          },
        },
      })
      const five = functions.find((func) => func.name === 'five')
      expect(five?.schedule).toBe('@daily')
    })

    test('listFunctions includes in-source config declarations', async () => {
      const fixtureDir = `${FIXTURES_DIR}/in-source-config/functions`
      const functions = await listFunctions(fixtureDir, {
        parseISC: true,
      })
      expect(functions.map((file) => normalizeFiles(fixtureDir, file))).toMatchSnapshot()
    })

    test('listFunctions includes json configured functions with configured properties', async () => {
      const dir = join(FIXTURES_DIR, 'json-config/.netlify/functions-internal/')
      const [func] = await listFunctions([dir], {
        configFileDirectories: [dir],
      })

      expect(func.displayName).toBe('A Display Name')
      expect(func.generator).toBe('@netlify/mock-plugin@1.0.0')
    })

    test('listFunctions does not include runtimeAPIVersion when parseISC is false', async () => {
      const dir = join(FIXTURES_DIR, 'list')
      const [func] = await listFunctions([dir], {
        parseISC: false,
      })

      expect(func.runtimeAPIVersion).toBeUndefined()
    })

    test('listFunctions includes runtimeAPIVersion when parseISC is true', async () => {
      const dir = join(FIXTURES_DIR, 'list')
      const [func] = await listFunctions([dir], {
        basePath: dir,
        parseISC: true,
      })

      expect(func.runtimeAPIVersion).toBe(1)
    })
  })

  describe('V2 API', () => {
    test('listFunctions does not include runtimeAPIVersion when parseISC is false', async () => {
      const dir = join(FIXTURES_ESM_DIR, 'v2-api')
      const [func] = await listFunctions([dir], {
        basePath: dir,
        parseISC: false,
      })

      expect(func.runtimeAPIVersion).toBeUndefined()
    })

    test('listFunctions includes runtimeAPIVersion when parseISC is true', async () => {
      const fixtureDir = join(FIXTURES_ESM_DIR, 'v2-api-esm-ts-aliases')
      const [func] = await listFunctions([fixtureDir], {
        basePath: fixtureDir,
        parseISC: true,
      })

      expect(normalizeFiles(fixtureDir, func)).toMatchSnapshot()
    })

    test('listFunctions includes routes when parseISC is true', async () => {
      const fixtureDir = join(FIXTURES_ESM_DIR, 'v2-api-with-path')
      const [func] = await listFunctions([fixtureDir], {
        basePath: fixtureDir,
        parseISC: true,
      })

      expect(normalizeFiles(fixtureDir, func)).toMatchSnapshot()
    })

    test('Accepts an object with mixed paths', async () => {
      const basePath = join(FIXTURES_ESM_DIR, 'v2-api-isolated')
      const functions = await listFunctions(
        {
          generated: {
            functions: [
              join(basePath, '.netlify/plugins/node_modules/extension-buildhooks/functions/extension-func1.mjs'),
              join(basePath, '.netlify/plugins/node_modules/extension-buildhooks/functions/extension-func2'),
            ],
          },
          user: {
            directories: [join(basePath, 'netlify/functions')],
          },
        },
        {
          basePath,
          parseISC: true,
        },
      )

      expect(functions.length).toBe(3)

      const userFunc1 = normalizeFiles(basePath, functions[0])
      expect(userFunc1.name).toBe('user-func1')
      expect(userFunc1.mainFile).toBe('netlify/functions/user-func1.mjs')

      const extensionFunc1 = normalizeFiles(basePath, functions[1])
      expect(extensionFunc1.name).toBe('extension-func1')
      expect(extensionFunc1.mainFile).toBe(
        '.netlify/plugins/node_modules/extension-buildhooks/functions/extension-func1.mjs',
      )

      const extensionFunc2 = normalizeFiles(basePath, functions[2])
      expect(extensionFunc2.name).toBe('extension-func2')
      expect(extensionFunc2.mainFile).toBe(
        '.netlify/plugins/node_modules/extension-buildhooks/functions/extension-func2/index.mjs',
      )
    })
  })
})
