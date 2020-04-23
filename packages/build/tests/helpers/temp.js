require('log-process-errors/build/register/ava')

const { realpath } = require('fs')
const { tmpdir } = require('os')
const { normalize } = require('path')
const { promisify } = require('util')

const makeDir = require('make-dir')

const pRealpath = promisify(realpath)

// Create and retrieve a new temporary sub-directory
const getTempDir = async function() {
  const id = String(Math.random()).replace('.', '')
  const tempDir = normalize(`${tmpdir()}/netlify-build-${id}`)
  await makeDir(tempDir)
  const tempDirA = await pRealpath(tempDir)
  return tempDirA
}

module.exports = { getTempDir }
