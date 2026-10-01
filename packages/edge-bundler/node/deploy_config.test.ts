import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { cwd } from 'process'

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
  const importMapFilePath = join(tmpdir(), `${randomUUID()}.json`)
  const configFilePath = join(tmpdir(), randomUUID())

  try {
    const importMap = {
      imports: {
        'https://deno.land/': 'https://black.hole/',
      },
    }

    await fs.writeFile(importMapFilePath, JSON.stringify(importMap))

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
      import_map: importMapFilePath,
      version: 1,
    }

    await fs.writeFile(configFilePath, JSON.stringify(config))

    const parsedConfig = await load(configFilePath, logger)

    expect(parsedConfig.declarations).toEqual(config.functions)
    expect(parsedConfig.layers).toEqual(config.layers)
    expect(parsedConfig.importMap).toBe(importMapFilePath)
  } finally {
    await fs.rm(importMapFilePath, { force: true })
    await fs.rm(configFilePath, { force: true })
  }
})
