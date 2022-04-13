import { promises as fs } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

import test from 'ava'
import tmp from 'tmp-promise'

import { bundle } from '../src/bundler.js'

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)

test('Produces a JavaScript bundle and a manifest file', async (t) => {
  const sourceDirectory = resolve(dirname, '..', 'fixtures', 'project_1', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations)
  const generatedFiles = await fs.readdir(tmpDir.path)

  t.is(result.functions.length, 1)
  t.is(generatedFiles.length, 2)

  // eslint-disable-next-line unicorn/prefer-json-parse-buffer
  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  t.is(bundles.length, 1)
  t.is(bundles[0].format, 'js')
  t.true(generatedFiles.includes(bundles[0].asset))

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Produces an additional ESZIP bundle when the `edge_functions_produce_eszip` feature flag is set', async (t) => {
  const sourceDirectory = resolve(dirname, '..', 'fixtures', 'project_1', 'functions')
  const tmpDir = await tmp.dir()
  const declarations = [
    {
      function: 'func1',
      path: '/func1',
    },
  ]
  const result = await bundle([sourceDirectory], tmpDir.path, declarations, {
    featureFlags: {
      edge_functions_produce_eszip: true,
    },
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  t.is(result.functions.length, 1)
  t.is(generatedFiles.length, 3)

  // eslint-disable-next-line unicorn/prefer-json-parse-buffer
  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles } = manifest

  t.is(bundles.length, 2)
  t.is(bundles[0].format, 'js')
  t.true(generatedFiles.includes(bundles[0].asset))
  t.is(bundles[1].format, 'eszip2')
  t.true(generatedFiles.includes(bundles[1].asset))

  await fs.rmdir(tmpDir.path, { recursive: true })
})
