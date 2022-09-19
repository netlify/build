import { promises as fs } from 'fs'
import { join } from 'path'
import process from 'process'
import { pathToFileURL } from 'url'

import test from 'ava'
import del from 'del'
import { execa } from 'execa'
import semver from 'semver'
import tmp from 'tmp-promise'

import { getLocalEntryPoint } from '../../node/formats/javascript.js'

test('`getLocalEntryPoint` returns a valid stage 2 file for local development', async (t) => {
  const { path: tmpDir } = await tmp.dir()

  // This is a fake bootstrap that we'll create just for the purpose of logging
  // the functions and the metadata that are sent to the `boot` function.
  const printer = `
    export const boot = async (functions, metadata) => {
      const responses = {}

      for (const name in functions) {
        responses[name] = await functions[name]()
      }

      console.log(JSON.stringify({ responses, metadata }))
    }
  `
  const printerPath = join(tmpDir, 'printer.mjs')

  await fs.writeFile(printerPath, printer)
  process.env.NETLIFY_EDGE_BOOTSTRAP = pathToFileURL(printerPath).toString()

  const functions = [
    { name: 'func1', path: join(tmpDir, 'func1.mjs'), response: 'Hello from function 1' },
    { name: 'func2', path: join(tmpDir, 'func2.mjs'), response: 'Hello from function 2' },
  ]

  for (const func of functions) {
    const contents = `export default () => ${JSON.stringify(func.response)}`

    await fs.writeFile(func.path, contents)
  }

  const stage2 = getLocalEntryPoint(
    functions.map(({ name, path }) => ({ name, path })),
    {},
  )
  const stage2Path = join(tmpDir, 'stage2.mjs')

  await fs.writeFile(stage2Path, stage2)

  const { stdout, stderr } = await execa('deno', ['run', '--allow-all', stage2Path])

  t.is(stderr, '')

  const { metadata, responses } = JSON.parse(stdout)

  for (const func of functions) {
    t.is(responses[func.name], func.response)
    t.is(metadata.functions[func.name].url, pathToFileURL(func.path).toString())
  }

  await del(tmpDir, { force: true })
  delete process.env.NETLIFY_EDGE_BOOTSTRAP
})
