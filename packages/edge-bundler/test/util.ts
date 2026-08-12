import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { stderr } from 'node:process'
import { fileURLToPath } from 'node:url'

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
      cleanup: () => Promise.allSettled([tmpDistDir.cleanup(), tmpFixtureDir.cleanup()]),
      distPath,
    }
  }

  return {
    basePath: fixtureDir,
    cleanup: tmpDistDir.cleanup,
    distPath,
  }
}

const inspectTarballFunction = () => `
import manifest from "./___netlify-edge-functions.json" with { type: "json" };

const responses = {};

for (const functionName in manifest.functions) {
  const req = new Request("https://test.netlify");
  // Import via a relative specifier so Deno resolves the module URL itself,
  // keeping its encoding consistent with the import map base (both derived from
  // cwd). Pre-building an absolute file:// URL on the Node side encodes paths
  // differently from Deno (e.g. '~' in Windows 8.3 short names), which breaks
  // import map prefix matching on Deno 2.8+.
  const func = await import("./" + manifest.functions[functionName]);
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
