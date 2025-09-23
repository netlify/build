import { rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { execa } from 'execa'
import tmp from 'tmp-promise'
import { test, expect } from 'vitest'

import { getLocalEntryPoint } from './formats/javascript.js'

test('`getLocalEntryPoint` returns a valid stage 2 file for local development', async () => {
  const { path: tmpDir } = await tmp.dir()

  // This is a fake bootstrap that we'll create just for the purpose of logging
  // the functions and the metadata that are sent to the `boot` function.
  // Supports both old and new API signatures for backward compatibility.
  const printer = `
    export const boot = async (functionsOrLoader, metadataArg) => {
      let functions, metadata

      if (typeof functionsOrLoader === 'function') {
        // New API (v2.15.0+): functions is a function returning Promise
        functions = await functionsOrLoader()
        metadata = { functions: {} }
        // Generate metadata for each function (simulating what the real bootstrap would have)
        for (const name in functions) {
          metadata.functions[name] = { url: new URL('./' + name + '.mjs', import.meta.url).href }
        }
      } else {
        // Old API (pre-v2.15.0): functions is object, metadata is second param
        functions = functionsOrLoader
        metadata = metadataArg || { functions: {} }
      }

      const responses = {}

      for (const name in functions) {
        responses[name] = await functions[name]()
      }

      console.log(JSON.stringify({ responses, metadata }))
    }
  `
  const printerPath = join(tmpDir, 'printer.mjs')
  const bootstrapURL = pathToFileURL(printerPath).toString()

  await writeFile(printerPath, printer)

  const functions = [
    { name: 'func1', path: join(tmpDir, 'func1.mjs'), response: 'Hello from function 1' },
    { name: 'func2', path: join(tmpDir, 'func2.mjs'), response: 'Hello from function 2' },
  ]

  for (const func of functions) {
    const contents = `export default () => ${JSON.stringify(func.response)}`

    await writeFile(func.path, contents)
  }

  const stage2 = getLocalEntryPoint(
    functions.map(({ name, path }) => ({ name, path })),
    { bootstrapURL },
  )
  const stage2Path = join(tmpDir, 'stage2.mjs')

  await writeFile(stage2Path, stage2)

  const { stdout, stderr } = await execa('deno', ['run', '--allow-all', stage2Path])

  expect(stderr).toBe('')

  const { metadata, responses } = JSON.parse(stdout)

  for (const func of functions) {
    expect(responses[func.name]).toBe(func.response)
    expect(metadata.functions[func.name].url).toBe(pathToFileURL(func.path).toString())
  }

  await rm(tmpDir, { force: true, recursive: true })
})

test('`getLocalEntryPoint` backward compatibility with old bootstrap API', async () => {
  const { path: tmpDir } = await tmp.dir()

  // This is a fake bootstrap that simulates the OLD API (pre-v2.15.0)
  // where boot expects (functions, metadata) instead of a function
  const oldBootstrap = `
    export const boot = async (functions, metadata) => {
      const responses = {}

      for (const name in functions) {
        responses[name] = await functions[name]()
      }

      console.log(JSON.stringify({ responses, metadata }))
    }
  `
  const oldBootstrapPath = join(tmpDir, 'old-bootstrap.mjs')
  const bootstrapURL = pathToFileURL(oldBootstrapPath).toString()

  await writeFile(oldBootstrapPath, oldBootstrap)

  const functions = [
    { name: 'func1', path: join(tmpDir, 'func1.mjs'), response: 'Hello from function 1' },
    { name: 'func2', path: join(tmpDir, 'func2.mjs'), response: 'Hello from function 2' },
  ]

  for (const func of functions) {
    const contents = `export default () => ${JSON.stringify(func.response)}`
    await writeFile(func.path, contents)
  }

  const stage2 = getLocalEntryPoint(
    functions.map(({ name, path }) => ({ name, path })),
    { bootstrapURL },
  )
  const stage2Path = join(tmpDir, 'stage2.mjs')

  await writeFile(stage2Path, stage2)

  const { stdout, stderr } = await execa('deno', ['run', '--allow-all', stage2Path])

  expect(stderr).toBe('')

  const { metadata, responses } = JSON.parse(stdout)

  for (const func of functions) {
    expect(responses[func.name]).toBe(func.response)
    expect(metadata.functions[func.name].url).toBe(pathToFileURL(func.path).toString())
  }

  await rm(tmpDir, { force: true, recursive: true })
})
