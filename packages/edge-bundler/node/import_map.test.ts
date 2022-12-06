import { join } from 'path'
import { cwd } from 'process'
import { pathToFileURL } from 'url'

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
  const { imports } = JSON.parse(map.getContents())

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:jamstack']).toBe('https://jamstack.org/')
  expect(imports['alias:pets']).toBe('https://petsofnetlify.com/')
})

test('Resolves relative paths to absolute paths if a root path is not provided', () => {
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  const map = new ImportMap([inputFile1])
  const { imports } = JSON.parse(map.getContents())
  const expectedPath = join(cwd(), 'my-cool-site', 'heart', 'pets')

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe(`${pathToFileURL(expectedPath).toString()}/`)
})

test('Transforms relative paths so that they use the root path as a base', () => {
  const basePath = join(cwd(), 'my-cool-site', 'import-map.json')
  const inputFile1 = {
    baseURL: pathToFileURL(basePath),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  const map = new ImportMap([inputFile1])
  const { imports } = JSON.parse(map.getContents(cwd()))

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe('./my-cool-site/heart/pets')
})
