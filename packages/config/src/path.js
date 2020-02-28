const { resolve } = require('path')
const { promisify } = require('util')
const { cwd: getCwd } = require('process')

const findUp = require('find-up')
const resolvePath = require('resolve')
const pathExists = require('path-exists')

const { throwError } = require('./error')

const pResolve = promisify(resolvePath)

// Configuration location can be:
//  - `undefined`, in which case `cwd` (default: current directory) is looked up
//    to find any file named `netlify.toml`, `netlify.yml`, etc.
//  - a local path
//  - a Node module. This allows configuration sharing
const getConfigPath = async function(configFile, cwd = getCwd()) {
  if (configFile === undefined) {
    return getDefaultConfig(cwd)
  }

  if (isNodeModule(configFile)) {
    return getModuleConfig(configFile, cwd)
  }

  return getLocalConfig(configFile, cwd)
}

const getDefaultConfig = function(cwd) {
  return findUp(FILENAMES, { cwd })
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json']

const isNodeModule = function(configFile) {
  return configFile.startsWith('@') || !configFile.includes('/')
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const getModuleConfig = async function(configFile, cwd) {
  try {
    return await pResolve(configFile, { basedir: cwd })
  } catch (error) {
    throwError(`Configuration file does not exist: ${configFile}`, error)
  }
}

const getLocalConfig = async function(configFile, cwd) {
  const configPath = resolve(cwd, configFile)

  if (!(await pathExists(configPath))) {
    throwError(`Configuration file does not exist: ${configPath}`)
  }

  return configPath
}

module.exports = { getConfigPath }
