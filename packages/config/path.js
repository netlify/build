const { resolve } = require('path')
const { promisify } = require('util')

const findUp = require('find-up')
const resolvePath = require('resolve')
const pathExists = require('path-exists')

const pResolve = promisify(resolvePath)

// Configuration location can be:
//  - `undefined`, in which case `cwd` (default: current directory) is looked up
//    to find any file named `netlify.toml`, `netlify.yml`, etc.
//  - a local path
//  - a Node module. This allows configuration sharing
const getConfigPath = async function(configFile, cwd) {
  if (configFile === undefined) {
    return getDefaultConfig(cwd)
  }

  if (isNodeModule(configFile)) {
    return getModuleConfig(configFile, cwd)
  }

  return getLocalConfig(configFile, cwd)
}

const getDefaultConfig = async function(cwd) {
  const configPath = await findUp(FILENAMES, { cwd })

  if (configPath === undefined) {
    throw new Error(`No netlify configuration file was found
 Please add a "netlify.yml", "netlify.toml", or "netlify.json" file and try again
`)
  }

  return configPath
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json', 'netlify.js']

const isNodeModule = function(configFile) {
  return configFile.startsWith('@') || !configFile.includes('/')
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const getModuleConfig = async function(configFile, cwd) {
  try {
    return await pResolve(configFile, { basedir: cwd })
  } catch (error) {
    error.message = `Configuration file does not exist: ${configFile}\n${error.message}`
    throw error
  }
}

const getLocalConfig = async function(configFile, cwd = process.cwd()) {
  const configPath = resolve(cwd, configFile)

  if (!(await pathExists(configPath))) {
    throw new Error(`Configuration file does not exist: ${configPath}`)
  }

  return configPath
}

module.exports = { getConfigPath }
