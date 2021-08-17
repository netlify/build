'use strict'

const { writeFile, readFile, readdir } = require('fs')
const { join, basename } = require('path')
const { promisify } = require('util')

const del = require('del')
const { dir: getTmpDir, tmpName } = require('tmp-promise')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)
const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)
const pReaddir = promisify(readdir)

const createTmpDir = async function (opts) {
  const { path } = await getTmpDir({ ...opts, prefix: PREFIX })
  return path
}

// Utility method to create a single temporary file and directory
const createTmpFile = async function ({ name, ...opts } = {}) {
  const [[tmpFile], tmpDir] = await createTmpFiles([{ name }], opts)
  return [tmpFile, tmpDir]
}

// Create multiple temporary files with a particular or random name, i.e.
// createTmpFiles([{name: 'test'}, {} {}]) => creates 3 files, one of them named test, under the same temporary dir
const createTmpFiles = async function (files, opts) {
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

const removeFiles = function (paths) {
  return del(paths, { force: true })
}

module.exports = {
  pSetTimeout,
  pWriteFile,
  pReadFile,
  pReaddir,
  createTmpDir,
  createTmpFile,
  createTmpFiles,
  removeFiles,
}
