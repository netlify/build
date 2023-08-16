import { promises as fs } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { pathToFileURL } from 'url'

import tmp from 'tmp-promise'
import { describe, test, expect } from 'vitest'

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
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts',
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
      'netlify:edge': 'https://edge.netlify.com/v1/index.ts',
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

  const map = new ImportMap([inputFile1], pathToFileURL(cwd()).toString())

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

  expect(imports['netlify:edge']).toBe('https://edge.netlify.com/v1/index.ts')
  expect(imports['alias:pets']).toBe(pathToFileURL(expectedPath).toString())
})
