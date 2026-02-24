import { execSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import { stderr, stdout } from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import cpy from 'cpy'
import { execa } from 'execa'
import * as tar from 'tar'
import tmp from 'tmp-promise'

import { getLogger } from '../node/logger.js'
import type { Manifest } from '../node/manifest.js'

export const testLogger = getLogger(() => {
  // no-op
})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
export const fixturesDir = resolve(dirname, '..', 'fixtures')

interface UseFixtureOptions {
  copyDirectory?: boolean
}

export const useFixture = async (fixtureName: string, { copyDirectory }: UseFixtureOptions = {}) => {
  const tmpDistDir = await tmp.dir({ unsafeCleanup: true })
  const fixtureDir = resolve(fixturesDir, fixtureName)
  const distPath = join(tmpDistDir.path, '.netlify', 'edge-functions-dist')

  if (copyDirectory) {
    const tmpFixtureDir = await tmp.dir({ unsafeCleanup: true })

    // TODO: Replace with `fs.cp` once the Node.js version range allows.
    await cpy(`${fixtureDir}/**`, tmpFixtureDir.path)

    return {
      basePath: tmpFixtureDir.path,
      cleanup: () => Promise.allSettled([tmpDistDir.cleanup, tmpFixtureDir.cleanup]),
      distPath,
    }
  }

  return {
    basePath: fixtureDir,
    cleanup: tmpDistDir.cleanup,
    distPath,
  }
}

const inspectESZIPFunction = (path: string) => `
  import { functions } from "${pathToFileURL(path)}.js";

  const responses = {};

  for (const functionName in functions) {
    const req = new Request("https://test.netlify");
    const res = await functions[functionName](req);

    responses[functionName] = await res.text();
  }
  
  console.log(JSON.stringify(responses));
`

const inspectTarballFunction = () => `
import path from "node:path";
import { pathToFileURL } from "node:url";
import manifest from "./___netlify-edge-functions.json" with { type: "json" };

const responses = {};

for (const functionName in manifest.functions) {
  const req = new Request("https://test.netlify");
  const entrypoint = path.resolve(manifest.functions[functionName]);
  const func = await import(pathToFileURL(entrypoint))
  const res = await func.default(req);

  responses[functionName] = await res.text();
}

console.log(JSON.stringify(responses));
`

export const getRouteMatcher = (manifest: Manifest) => (candidate: string) =>
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

export const runESZIP = async (eszipPath: string, vendorDirectory?: string) => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true })

  // Extract ESZIP into temporary directory.
  const extractCommand = execa('deno', [
    'run',
    '--allow-all',
    '--no-lock',
    'https://deno.land/x/eszip@v0.55.2/eszip.ts',
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

    let normalizedFile = file.replace(/file:\/{3}root/g, pathToFileURL(virtualRootPath).toString())

    if (vendorDirectory !== undefined) {
      normalizedFile = normalizedFile.replace(/file:\/{3}vendor/g, pathToFileURL(vendorDirectory).toString())
    }

    await fs.writeFile(path, normalizedFile)
  }

  await fs.rename(stage2Path, `${stage2Path}.js`)

  // Run function that imports the extracted stage 2 and invokes each function.
  const evalCommand = execa('deno', ['eval', '--import-map', importMapPath, inspectESZIPFunction(stage2Path)])

  evalCommand.stderr?.pipe(stderr)

  const result = await evalCommand

  await tmpDir.cleanup()

  return JSON.parse(result.stdout)
}

export const runTarball = async (tarballPath: string) => {
  const tmpDir = await tmp.dir({ unsafeCleanup: true })

  await tar.extract({
    cwd: tmpDir.path,
    file: tarballPath,
  })

  const evalCommand = execa('deno', ['eval', '--vendor', inspectTarballFunction()], {
    cwd: tmpDir.path,
  })

  evalCommand.stderr?.pipe(stderr)

  const result = await evalCommand

  await tmpDir.cleanup()

  return JSON.parse(result.stdout)
}

export const denoVersion = execSync('deno eval --no-lock "console.log(Deno.version.deno)"').toString()
