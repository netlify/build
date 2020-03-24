const { writeFile, readFile } = require('fs')
const { promisify } = require('util')

const del = require('del')
const { file: getTmpFile, dir: getTmpDir } = require('tmp-promise')

const pSetTimeout = promisify(setTimeout)
const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const createTmpDir = async function() {
  const { path } = await getTmpDir({ prefix: PREFIX })
  return path
}

const createTmpFile = async function(opts) {
  const { path } = await getTmpFile({ ...opts, prefix: PREFIX })
  return path
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
