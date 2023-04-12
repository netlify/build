import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.177.0/testing/asserts.ts'

import { join } from 'https://deno.land/std@0.177.0/path/mod.ts'
import { pathToFileURL } from 'https://deno.land/std@0.177.0/node/url.ts'

import { getStage2Entry } from './stage2.ts'
import { virtualRoot } from './consts.ts'

Deno.test('`getStage2Entry` returns a valid stage 2 file', async () => {
  const directory = await Deno.makeTempDir()
  const functions = [
    {
      name: 'func1',
      path: join(directory, 'func1.ts'),
      response: 'Hello from function 1',
    },
    {
      name: 'func2',
      path: join(directory, 'func2.ts'),
      response: 'Hello from function 2',
    },
  ]

  for (const func of functions) {
    const contents = `export default async () => new Response(${JSON.stringify(func.response)})`

    await Deno.writeTextFile(func.path, contents)
  }

  const baseURL = pathToFileURL(directory)
  const stage2 = getStage2Entry(
    directory,
    functions.map(({ name, path }) => ({ name, path })),
  )

  // Ensuring that the stage 2 paths have the virtual root before we strip it.
  assertStringIncludes(stage2, virtualRoot)

  // Replacing the virtual root with the URL of the temporary directory so that
  // we can actually import the module.
  const normalizedStage2 = stage2.replaceAll(virtualRoot, `${baseURL.href}/`)

  const stage2Path = join(directory, 'stage2.ts')
  const stage2URL = pathToFileURL(stage2Path)

  await Deno.writeTextFile(stage2Path, normalizedStage2)

  const mod = await import(stage2URL.href)

  await Deno.remove(directory, { recursive: true })

  for (const func of functions) {
    const result = await mod.functions[func.name]()

    assertEquals(await result.text(), func.response)
    assertEquals(mod.metadata.functions[func.name].url, pathToFileURL(func.path).toString())
  }
})
