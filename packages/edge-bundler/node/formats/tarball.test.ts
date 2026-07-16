import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { rewriteImportAssertions } from './tarball.js'

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
