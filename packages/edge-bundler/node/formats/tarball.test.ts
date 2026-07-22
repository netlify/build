import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { DenoBridge } from '../bridge.js'
import { ImportMap } from '../import_map.js'

import { getRequiredSourceFiles, rewriteImportAssertions } from './tarball.js'

describe('rewriteImportAssertions', () => {
  let workDir: string

  beforeEach(async () => {
    workDir = await fs.mkdtemp(join(tmpdir(), 'edge-bundler-tarball-'))
  })

  afterEach(async () => {
    await fs.rm(workDir, { recursive: true, force: true })
  })

  test('rewrites import assertions in a source file', async () => {
    const sourceFile = join(workDir, 'source.ts')
    const destFile = join(workDir, 'dest.ts')
    await fs.writeFile(sourceFile, `import data from './data.json' assert { type: 'json' };\n`)

    await rewriteImportAssertions(sourceFile, destFile)

    expect(await fs.readFile(destFile, 'utf-8')).toBe(`import data from './data.json' with { type: 'json' };\n`)
  })

  test('copies a file without rewritable extension verbatim', async () => {
    const sourceFile = join(workDir, 'data.json')
    const destFile = join(workDir, 'dest.json')
    await fs.writeFile(sourceFile, `{ "assert": true }`)

    await rewriteImportAssertions(sourceFile, destFile)

    expect(await fs.readFile(destFile, 'utf-8')).toBe(`{ "assert": true }`)
  })

  // `deno info` can report a directory as a module specifier when source code
  // imports a directory (e.g. `import x from './models'`). Copying or reading a
  // directory throws EISDIR, which used to abort tarball generation.
  test('skips a directory instead of throwing EISDIR', async () => {
    const sourceDir = join(workDir, 'models')
    const destDir = join(workDir, 'dest-models')
    await fs.mkdir(sourceDir)

    await expect(rewriteImportAssertions(sourceDir, destDir)).resolves.toBeUndefined()

    // Nothing should have been written for the directory.
    await expect(fs.stat(destDir)).rejects.toThrow()
  })
})

describe('getRequiredSourceFiles', () => {
  const entryPoint = join(tmpdir(), 'func.ts')
  const graph = JSON.stringify({ roots: [pathToFileURL(entryPoint).href], modules: [] })
  const importMap = new ImportMap()

  // Only `run` and `logger` are reached by the code under test.
  const stubDeno = (run: () => Promise<unknown>) => ({ run, logger: { system: () => {} } }) as unknown as DenoBridge

  test('retries `deno info` when it fails with a transient network error', async () => {
    let attempts = 0
    const deno = stubDeno(() => {
      attempts += 1

      if (attempts < 3) {
        return Promise.reject(
          new Error('Command failed with exit code 1:\n\nCaused by:\n    error reading a body from connection'),
        )
      }

      return Promise.resolve({ stdout: graph })
    })

    await expect(getRequiredSourceFiles(deno, [entryPoint], importMap)).resolves.toBeInstanceOf(Set)
    expect(attempts).toBe(3)
  }, 30_000)

  test('does not retry a deterministic `deno info` failure', async () => {
    let attempts = 0
    const deno = stubDeno(() => {
      attempts += 1

      return Promise.reject(
        new Error("Command failed with exit code 1:\n\nerror: The module's source code could not be parsed"),
      )
    })

    await expect(getRequiredSourceFiles(deno, [entryPoint], importMap)).rejects.toThrow('could not be parsed')
    expect(attempts).toBe(1)
  })
})
