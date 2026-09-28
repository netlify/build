import { randomUUID } from 'crypto'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const PREFIX = 'test-cache-utils-'

export const createTmpDir = async function ({ tmpdir: baseDir = tmpdir() }: { tmpdir?: string } = {}) {
  return mkdtemp(join(baseDir, PREFIX))
}

// Utility method to create a single temporary file and directory
export const createTmpFile = async function ({
  name,
  ...opts
}: {
  name?: string
  tmpdir?: string
} = {}): Promise<string[]> {
  const [[tmpFile], tmpDir] = await createTmpFiles([{ name }], opts)
  return [tmpFile, tmpDir]
}

// Create multiple temporary files with a particular or random name, i.e.
// createTmpFiles([{name: 'test'}, {} {}]) => creates 3 files, one of them named test, under the same temporary dir
export const createTmpFiles = async function (files: any[], opts = {}): Promise<[string[], string]> {
  const tmpDir = await createTmpDir(opts)
  const tmpFiles = await Promise.all(
    files.map(async ({ name }) => {
      const filename = name || randomUUID()
      const tmpFile = join(tmpDir, filename)
      await writeFile(tmpFile, '')
      return tmpFile
    }),
  )
  return [tmpFiles, tmpDir]
}

export const removeFiles = async function (paths: string | string[]): Promise<void> {
  const dirs = Array.isArray(paths) ? paths : [paths]

  for (const dir of dirs) {
    await rm(dir, { force: true, recursive: true, maxRetries: 10 })
  }
}
