const { dirname } = require('path')
const { cwd } = require('process')

// Retrieve the base directory used to resolve most paths.
// This is the configuration file's directory.
const getBaseDir = async function(configPath) {
  if (configPath === undefined) {
    return cwd()
  }

  return dirname(configPath)
}

module.exports = { getBaseDir }
