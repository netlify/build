import { test, expect } from 'vitest'

import { ImportMap } from './import_map.js'

test('Handles import maps with full URLs without specifying a base URL', () => {
  const inputFile1 = {
    baseURL: new URL('file:///some/path/import-map.json'),
    imports: {
      'alias:jamstack': 'https://jamstack.org',
    },
  }
  const inputFile2 = {
    baseURL: new URL('file:///some/path/import-map.json'),
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

test('Handles import maps with relative paths', () => {
  const inputFile1 = {
    baseURL: new URL('file:///Users/jane-doe/my-site/import-map.json'),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  const map = new ImportMap([inputFile1])
  const { imports } = JSON.parse(map.getContents())

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe('file:///Users/jane-doe/my-site/heart/pets/')
})
