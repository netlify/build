const { resolve } = require('path')

const findUp = require('find-up')
const pathExists = require('path-exists')

const { throwError } = require('./error')

// Configuration location can be:
//  - `undefined`, in which case `cwd` (default: current directory) is looked up
//    to find any file named `netlify.toml`, `netlify.yml`, etc.
//  - a local path
//  - a Node module. This allows configuration sharing
const getConfigPath = async function(configFile, cwd) {
  if (configFile === undefined) {
    return getDefaultConfig(cwd)
  }

  return getLocalConfig(configFile, cwd)
}

const getDefaultConfig = function(cwd) {
  return findUp(FILENAMES, { cwd })
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json']

const getLocalConfig = async function(configFile, cwd) {
  const configPath = resolve(cwd, configFile)

  if (!(await pathExists(configPath))) {
    throwError(`Configuration file does not exist: ${configPath}`)
  }

  return configPath
}

module.exports = { getConfigPath }
