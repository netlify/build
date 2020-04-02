const { writeFile, readFile } = require('fs')
const { join, basename } = require('path')
const { promisify } = require('util')

const del = require('del')
const { dir: getTmpDir, tmpName } = require('tmp-promise')

const pSetTimeout = promisify(setTimeout)
const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const createTmpDir = async function(opts) {
  const { path } = await getTmpDir({ ...opts, prefix: PREFIX })
  return path
}

const createTmpFile = async function(opts) {
  const tmpDir = await createTmpDir(opts)
  const filename = basename(await tmpName())
  const tmpFile = join(tmpDir, filename)
  await pWriteFile(tmpFile, '')
  return [tmpFile, tmpDir]
}

const PREFIX = 'test-cache-utils-'

const removeFiles = function(paths) {
  return del(paths, { force: true })
}

module.exports = {
  pSetTimeout,
  pWriteFile,
  pReadFile,
  createTmpDir,
  createTmpFile,
  removeFiles,
}
