import { writeFile, readFile, readdir } from 'fs'
import { join, basename } from 'path'
import { promisify } from 'util'

import del from 'del'
import { dir as getTmpDir, tmpName } from 'tmp-promise'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
export const pSetTimeout = promisify(setTimeout)
export const pWriteFile = promisify(writeFile)
export const pReadFile = promisify(readFile)
export const pReaddir = promisify(readdir)

export const createTmpDir = async function (opts) {
  const { path } = await getTmpDir({ ...opts, prefix: PREFIX })
  return path
}

// Utility method to create a single temporary file and directory
export const createTmpFile = async function ({ name, ...opts } = {}) {
  const [[tmpFile], tmpDir] = await createTmpFiles([{ name }], opts)
  return [tmpFile, tmpDir]
}

// Create multiple temporary files with a particular or random name, i.e.
// createTmpFiles([{name: 'test'}, {} {}]) => creates 3 files, one of them named test, under the same temporary dir
export const createTmpFiles = async function (files, opts) {
  const tmpDir = await createTmpDir(opts)
  const tmpFiles = await Promise.all(
    files.map(async ({ name }) => {
      const filename = name || basename(await tmpName())
      const tmpFile = join(tmpDir, filename)
      await pWriteFile(tmpFile, '')
      return tmpFile
    }),
  )
  return [tmpFiles, tmpDir]
}

const PREFIX = 'test-cache-utils-'

export const removeFiles = function (paths) {
  return del(paths, { force: true })
}
