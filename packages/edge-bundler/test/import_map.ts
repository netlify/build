import test from 'ava'

import { ImportMap } from '../node/import_map.js'

test('Handles import maps with full URLs without specifying a base URL', (t) => {
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

  t.is(imports['netlify:edge'], 'https://edge.netlify.com/v1/index.ts')
  t.is(imports['alias:jamstack'], 'https://jamstack.org/')
  t.is(imports['alias:pets'], 'https://petsofnetlify.com/')
})

test('Handles import maps with relative paths', (t) => {
  const inputFile1 = {
    baseURL: new URL('file:///Users/jane-doe/my-site/import-map.json'),
    imports: {
      'alias:pets': './heart/pets/',
    },
  }

  const map = new ImportMap([inputFile1])
  const { imports } = JSON.parse(map.getContents())

  t.is(imports['netlify:edge'], 'https://edge.netlify.com/v1/index.ts')
  t.is(imports['alias:pets'], 'file:///Users/jane-doe/my-site/heart/pets/')
})
