import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { stderr, stdout } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'

import { execa } from 'execa'
import tmp from 'tmp-promise'

import { getLogger } from '../node/logger.js'
import type { Manifest } from '../node/manifest.js'

const testLogger = getLogger(() => {
  // no-op
})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

const useFixture = async (fixtureName: string) => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true })
  const fixtureDir = resolve(fixturesDir, fixtureName)
  const distPath = join(tmpDir.path, '.netlify', 'edge-functions-dist')

  return {
    basePath: fixtureDir,
    cleanup: tmpDir.cleanup,
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

const getRouteMatcher = (manifest: Manifest) => (candidate: string) =>
  manifest.routes.find((route) => {
    const regex = new RegExp(route.pattern)

    if (!regex.test(candidate)) {
      return false
    }

    if (route.excluded_patterns.some((pattern) => new RegExp(pattern).test(candidate))) {
      return false
    }

    const excludedPatterns = manifest.function_config[route.function]?.excluded_patterns ?? []
    const isExcluded = excludedPatterns.some((pattern) => new RegExp(pattern).test(candidate))

    return !isExcluded
  })

const runESZIP = async (eszipPath: string) => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true })

  // Extract ESZIP into temporary directory.
  const extractCommand = execa('deno', [
    'run',
    '--allow-all',
    'https://deno.land/x/eszip@v0.40.0/eszip.ts',
    'x',
    eszipPath,
    tmpDir.path,
  ])

  extractCommand.stderr?.pipe(stderr)
  extractCommand.stdout?.pipe(stdout)

  await extractCommand

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
  const evalCommand = execa('deno', ['eval', '--no-check', '--import-map', importMapPath, inspectFunction(stage2Path)])

  evalCommand.stderr?.pipe(stderr)

  const result = await evalCommand

  await tmpDir.cleanup()

  return JSON.parse(result.stdout)
}

export { fixturesDir, getRouteMatcher, testLogger, runESZIP, useFixture }
