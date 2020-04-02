require('log-process-errors/build/register/ava')

const { realpath } = require('fs')
const { tmpdir } = require('os')
const { normalize, basename } = require('path')
const { promisify } = require('util')

const cpFile = require('cp-file')
const makeDir = require('make-dir')

const pRealpath = promisify(realpath)

// Copy a file to a temporary one
const copyToTemp = async function(path) {
  const filename = basename(path)
  const tempDir = await getTempDir()
  const tempFile = normalize(`${tempDir}/${filename}`)
  await cpFile(path, tempFile)
  return { tempDir, tempFile }
}

// Create and retrieve a new temporary sub-directory
const getTempDir = async function() {
  const id = String(Math.random()).replace('.', '')
  const tempDir = normalize(`${tmpdir()}/netlify-build-${id}`)
  await makeDir(tempDir)
  const tempDirA = await pRealpath(tempDir)
  return tempDirA
}

module.exports = { copyToTemp, getTempDir }
