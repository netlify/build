const { dirname } = require('path')
const { cwd } = require('process')
const {
  access,
  constants: { R_OK, W_OK },
} = require('fs')
const { promisify } = require('util')

const pAccess = promisify(access)

// Retrieve the base directory used to resolve most paths.
// This is the configuration file's directory.
const getBaseDir = async function(configPath) {
  const baseDir = getBaseDirValue(configPath)
  await validatePermissions(baseDir)
  return baseDir
}

const getBaseDirValue = function(configPath) {
  if (configPath === undefined) {
    return cwd()
  }

  return dirname(configPath)
}

const validatePermissions = async function(baseDir) {
  try {
    await pAccess(baseDir, R_OK | W_OK)
  } catch (error) {
    throw new Error(`Wrong permissions on the base directory ${baseDir}`)
  }
}

module.exports = { getBaseDir }
