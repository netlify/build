import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { execa } from 'execa'
import tmp from 'tmp-promise'

import { getLogger } from '../node/logger.js'

const testLogger = getLogger(() => {
  // no-op
})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

const useFixture = async (fixtureName: string) => {
  const tmpDir = await tmp.dir()
  const cleanup = () => fs.rmdir(tmpDir.path, { recursive: true })
  const fixtureDir = resolve(fixturesDir, fixtureName)
  const distPath = join(tmpDir.path, '.netlify', 'edge-functions-dist')

  return {
    basePath: fixtureDir,
    cleanup,
    distPath,
  }
}

const inspectFunction = (path: string) => `
  import { functions } from "${pathToFileURL(path)}.js";

  const responses = {};

  for (const functionName in functions) {
    const req = new Request("https://test.netlify");
    const res = await functions[functionName](req);

    responses[functionName] = await res.text();
  }
  
  console.log(JSON.stringify(responses));
`

const runESZIP = async (eszipPath: string) => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true })

  // Extract ESZIP into temporary directory.
  await execa('deno', ['run', '--allow-all', 'https://deno.land/x/eszip@v0.28.0/eszip.ts', 'x', eszipPath, tmpDir.path])

  const virtualRootPath = join(tmpDir.path, 'source', 'root')
  const stage2Path = join(virtualRootPath, '..', 'bootstrap-stage2')
  const importMapPath = join(virtualRootPath, '..', 'import-map')

  for (const path of [importMapPath, stage2Path]) {
    const file = await fs.readFile(path, 'utf8')
    const normalizedFile = file.replace(/file:\/\/\/root/g, pathToFileURL(virtualRootPath).toString())

    await fs.writeFile(path, normalizedFile)
  }

  await fs.rename(stage2Path, `${stage2Path}.js`)

  // Run function that imports the extracted stage 2 and invokes each function.
  const { stdout } = await execa('deno', [
    'eval',
    '--no-check',
    '--import-map',
    importMapPath,
    inspectFunction(stage2Path),
  ])

  await tmpDir.cleanup()

  return JSON.parse(stdout)
}

export { fixturesDir, testLogger, runESZIP, useFixture }
