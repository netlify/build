import { promises as fs } from 'fs'
import { join } from 'path'
import { cwd } from 'process'

import tmp from 'tmp-promise'
import { test, expect } from 'vitest'

import { load } from './deploy_config.js'
import { getLogger } from './logger.js'

const logger = getLogger(console.log)

test('Returns an empty config object if there is no file at the given path', async () => {
  const mockPath = join(cwd(), 'some-directory', `a-file-that-does-not-exist-${Date.now()}.json`)
  const config = await load(mockPath, logger)

  expect(config.declarations).toEqual([])
  expect(config.layers).toEqual([])
})

test('Returns a config object with declarations, layers, and import map', async () => {
  const importMapFile = await tmp.file({ postfix: '.json' })
  const importMap = {
    imports: {
      'https://deno.land/': 'https://black.hole/',
    },
  }

  await fs.writeFile(importMapFile.path, JSON.stringify(importMap))

  const configFile = await tmp.file()
  const config = {
    functions: [
      {
        function: 'func1',
        path: '/func1',
        generator: 'internalFunc',
      },
    ],
    layers: [
      {
        name: 'layer1',
        flag: 'edge_functions_layer1_url',
        local: 'https://some-url.netlify.app/mod.ts',
      },
    ],
    import_map: importMapFile.path,
    version: 1,
  }

  await fs.writeFile(configFile.path, JSON.stringify(config))

  const parsedConfig = await load(configFile.path, logger)

  await importMapFile.cleanup()

  expect(parsedConfig.declarations).toEqual(config.functions)
  expect(parsedConfig.layers).toEqual(config.layers)
  expect(parsedConfig.importMap).toBe(importMapFile.path)
})
