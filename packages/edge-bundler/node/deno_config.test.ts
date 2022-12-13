import { promises as fs } from 'fs'
import { join } from 'path'

import tmp from 'tmp-promise'
import { expect, test } from 'vitest'

import { getConfig } from './deno_config.js'

test('Returns `undefined` if no config file is found', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const config = await getConfig(path)

  expect(config).toBeUndefined()

  await cleanup()
})

test('Returns an empty object if the config file cannot be parsed', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const configPath = join(path, 'deno.json')

  await fs.writeFile(configPath, '{')

  const config = await getConfig(path)

  expect(config).toEqual({})

  await cleanup()
})

test('Throws a type error if the `importMap` contains anything other than a string', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const configPath = join(path, 'deno.json')
  const data = JSON.stringify({ importMap: { imports: { foo: './bar/' } } })

  await fs.writeFile(configPath, data)

  await expect(getConfig(path)).rejects.toThrowError(TypeError)

  await cleanup()
})

test('Excludes unsupported properties', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const configPath = join(path, 'deno.json')
  const data = JSON.stringify({
    compilerOptions: {
      allowJs: true,
      lib: ['deno.window'],
      strict: true,
    },
    importMap: 'import_map.json',
    lint: {
      files: {
        include: ['src/'],
        exclude: ['src/testdata/'],
      },
      rules: {
        tags: ['recommended'],
        include: ['ban-untagged-todo'],
        exclude: ['no-unused-vars'],
      },
    },
    fmt: {
      files: {
        include: ['src/'],
        exclude: ['src/testdata/'],
      },
      options: {
        useTabs: true,
        lineWidth: 80,
        indentWidth: 4,
        singleQuote: true,
        proseWrap: 'preserve',
      },
    },
    test: {
      files: {
        include: ['src/'],
        exclude: ['src/testdata/'],
      },
    },
  })

  await fs.writeFile(configPath, data)

  const config = await getConfig(path)

  expect(Object.keys(config ?? {})).toEqual(['importMap'])

  await cleanup()
})

test('Resolves `importMap` into an absolute path', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const configPath = join(path, 'deno.json')
  const data = JSON.stringify({ importMap: 'import_map.json' })

  await fs.writeFile(configPath, data)

  const config = await getConfig(path)

  expect(config).toEqual({ importMap: join(path, 'import_map.json') })

  await cleanup()
})

test('Supports JSONC', async () => {
  const { cleanup, path } = await tmp.dir({ unsafeCleanup: true })
  const configPath = join(path, 'deno.jsonc')
  const data = JSON.stringify({ importMap: 'import_map.json' })

  await fs.writeFile(configPath, `// This is a comment\n${data}`)

  const config = await getConfig(path)

  expect(config).toEqual({ importMap: join(path, 'import_map.json') })

  await cleanup()
})
