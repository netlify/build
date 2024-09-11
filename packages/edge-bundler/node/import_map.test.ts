import { promises as fs } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { pathToFileURL } from 'url'

import tmp from 'tmp-promise'
import { describe, test, expect } from 'vitest'

import { ImportMap } from './import_map.js'
import { getLogger } from './logger.js'

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

  const m1 = map.getContents()

  expect(m1.imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts?v=legacy')
  expect(m1.imports['@netlify/edge-functions']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(m1.imports['alias:jamstack']).toBe('https://jamstack.org/')
  expect(m1.imports['alias:pets']).toBe('https://petsofnetlify.com/')

  const m2 = map.getContentsWithURLObjects()

  expect(m2.imports['netlify:edge']).toStrictEqual(new URL('https://edge.netlify.com/v1/index.ts?v=legacy'))
  expect(m2.imports['@netlify/edge-functions']).toStrictEqual(new URL('https://edge.netlify.com/v1/index.ts'))
  expect(m2.imports['alias:jamstack']).toStrictEqual(new URL('https://jamstack.org/'))
  expect(m2.imports['alias:pets']).toStrictEqual(new URL('https://petsofnetlify.com/'))
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
  const expectedPath = join(cwd(), 'my-cool-site', 'heart', 'pets')

  const m1 = map.getContents()

  expect(m1.imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts?v=legacy')
  expect(m1.imports['@netlify/edge-functions']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(m1.imports['alias:pets']).toBe(`${pathToFileURL(expectedPath).toString()}/`)

  const m2 = map.getContentsWithURLObjects()

  expect(m2.imports['netlify:edge']).toStrictEqual(new URL('https://edge.netlify.com/v1/index.ts?v=legacy'))
  expect(m2.imports['@netlify/edge-functions']).toStrictEqual(new URL('https://edge.netlify.com/v1/index.ts'))
  expect(m2.imports['alias:pets']).toStrictEqual(new URL(`${pathToFileURL(expectedPath).toString()}/`))
})

describe('Returns the fully resolved import map', () => {
  const inputFile1 = {
    baseURL: new URL('file:///some/full/path/import-map.json'),
    imports: {
      specifier1: 'file:///some/full/path/file.js',
      specifier2: './file2.js',
      specifier3: 'file:///different/full/path/file3.js',
    },
  }
  const inputFile2 = {
    baseURL: new URL('file:///some/cool/path/import-map.json'),
    imports: {
      'lib/*': './library/',
    },
    scopes: {
      'with/scopes/': {
        'lib/*': 'https://external.netlify/lib/',
        foo: './foo-alias',
        bar: 'file:///different/full/path/bar.js',
      },
    },
  }

  test('Without prefixes', () => {
    const map = new ImportMap([inputFile1, inputFile2])
    const { imports, scopes } = map.getContents()

    expect(imports).toStrictEqual({
      'lib/*': 'file:///some/cool/path/library/',
      specifier3: 'file:///different/full/path/file3.js',
      specifier2: 'file:///some/full/path/file2.js',
      specifier1: 'file:///some/full/path/file.js',
      '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
    })

    expect(scopes).toStrictEqual({
      'file:///some/cool/path/with/scopes/': {
        'lib/*': 'https://external.netlify/lib/',
        foo: 'file:///some/cool/path/foo-alias',
        bar: 'file:///different/full/path/bar.js',
      },
    })
  })

  test('With prefixes', () => {
    const map = new ImportMap([inputFile1, inputFile2])
    const { imports, scopes } = map.getContents({
      'file:///some/': 'file:///root/',
      'file:///different/': 'file:///vendor/',
    })

    expect(imports).toStrictEqual({
      'lib/*': 'file:///root/cool/path/library/',
      specifier3: 'file:///vendor/full/path/file3.js',
      specifier2: 'file:///root/full/path/file2.js',
      specifier1: 'file:///root/full/path/file.js',
      '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
    })

    expect(scopes).toStrictEqual({
      'file:///root/cool/path/with/scopes/': {
        'lib/*': 'https://external.netlify/lib/',
        foo: 'file:///root/cool/path/foo-alias',
        bar: 'file:///vendor/full/path/bar.js',
      },
    })
  })
})

test('Throws when an import map uses a relative path to reference a file outside of the base path', () => {
  const inputFile1 = {
    baseURL: pathToFileURL(join(cwd(), 'import-map.json')),
    imports: {
      'alias:file': '../file.js',
    },
  }

  const map = new ImportMap([inputFile1], cwd())

  expect(() => map.getContents()).toThrowError(
    `Import map cannot reference '${join(cwd(), '..', 'file.js')}' as it's outside of the base directory '${cwd()}'`,
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

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts?v=legacy')
  expect(imports['@netlify/edge-functions']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe(pathToFileURL(expectedPath).toString())
})

test('Respects import map when it has only scoped key', async () => {
  const file = await tmp.file()
  const importMap = {
    scopes: {
      './foo': {
        'alias:pets': './heart/pets/file.ts',
      },
    },
  }
  await fs.writeFile(file.path, JSON.stringify(importMap))
  const map = new ImportMap()
  await map.addFile(file.path, getLogger())

  expect(map.getContents()).toEqual({
    imports: {
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
      '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
    },
    scopes: {
      [pathToFileURL(join(file.path, '../foo')).href]: {
        'alias:pets': pathToFileURL(join(file.path, '../heart/pets/file.ts')).href,
      },
    },
  })
})

test('Clones an import map', () => {
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

  const map1 = new ImportMap([inputFile1, inputFile2])
  const map2 = map1.clone()

  map2.add({
    baseURL: pathToFileURL(basePath),
    imports: {
      netlify: 'https://netlify.com',
    },
  })

  expect(map1.getContents()).toStrictEqual({
    imports: {
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
      '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
      'alias:jamstack': 'https://jamstack.org/',
      'alias:pets': 'https://petsofnetlify.com/',
    },
    scopes: {},
  })

  expect(map2.getContents()).toStrictEqual({
    imports: {
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
      '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
      'alias:jamstack': 'https://jamstack.org/',
      'alias:pets': 'https://petsofnetlify.com/',
      netlify: 'https://netlify.com/',
    },
    scopes: {},
  })
})
