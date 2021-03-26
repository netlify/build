'use strict'

require('log-process-errors/build/register/ava')

const { realpath } = require('fs')
const { tmpdir } = require('os')
const { normalize } = require('path')
const { promisify } = require('util')

const makeDir = require('make-dir')

const pRealpath = promisify(realpath)

// Create and retrieve a new temporary sub-directory
const getTempDir = async function () {
  const tempDir = await getTempName()
  await makeDir(tempDir)
  return tempDir
}

const getTempName = async function () {
  const tempDir = tmpdir()
  const tempDirA = await pRealpath(tempDir)
  const id = String(Math.random()).replace('.', '')
  const tempName = normalize(`${tempDirA}/netlify-build-tmp-dir${id}`)
  return tempName
}

module.exports = { getTempDir }
