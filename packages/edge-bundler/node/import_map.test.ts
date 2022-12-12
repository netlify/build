import { promises as fs } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { pathToFileURL } from 'url'

import tmp from 'tmp-promise'
import { test, expect } from 'vitest'

import { ImportMap } from './import_map.js'

test('Handles import maps with full URLs without specifying a base URL', () => {
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:jamstack': 'https://jamstack.org',
    },
  }
  const inputFile2 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': 'https://petsofnetlify.com/',
    },
  }

  const map = new ImportMap([inputFile1, inputFile2])
  const { imports } = map.getContents()

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:jamstack']).toBe('https://jamstack.org/')
  expect(imports['alias:pets']).toBe('https://petsofnetlify.com/')
})

test('Resolves relative paths to absolute paths if a base path is not provided', () => {
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  const map = new ImportMap([inputFile1])
  const { imports } = map.getContents()
  const expectedPath = join(cwd(), 'my-cool-site', 'heart', 'pets')

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe(`${pathToFileURL(expectedPath).toString()}/`)
})

test('Transforms relative paths so that they become relative to the base path', () => {
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  // Without a prefix.
  const map1 = new ImportMap([inputFile1])
  const { imports: imports1 } = map1.getContents(cwd())

  expect(imports1['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports1['alias:pets']).toBe('file:///my-cool-site/heart/pets/')

  // With a prefix.
  const map2 = new ImportMap([inputFile1])
  const { imports: imports2 } = map2.getContents(cwd(), 'file:///root/')

  expect(imports2['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports2['alias:pets']).toBe('file:///root/my-cool-site/heart/pets/')
})

test('Throws when an import map uses a relative path to reference a file outside of the base path', () => {
  const basePath = join(cwd(), 'my-cool-site')
  const inputFile1 = {
    baseURL: pathToFileURL(join(basePath, 'import_map.json')),
    imports: {
      'alias:file': '../file.js',
    },
  }

  const map = new ImportMap([inputFile1])

  expect(() => map.getContents(basePath)).toThrowError(
    `Import map cannot reference '${join(cwd(), 'file.js')}' as it's outside of the base directory '${basePath}'`,
  )
})

test('Writes import map file to disk', async () => {
  const file = await tmp.file()
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': './heart/pets/file.ts',
    },
  }

  const map = new ImportMap([inputFile1])

  await map.writeToFile(file.path)

  const createdFile = await fs.readFile(file.path, 'utf8')
  const { imports } = JSON.parse(createdFile)
  const expectedPath = join(cwd(), 'my-cool-site', 'heart', 'pets', 'file.ts')

  await file.cleanup()

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe(pathToFileURL(expectedPath).toString())
})
