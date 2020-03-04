const { resolve } = require('path')

const findUp = require('find-up')
const pathExists = require('path-exists')
const locatePath = require('locate-path')

const { throwError } = require('./error')

// Configuration location can be:
//  - a local path with the --config CLI flag
//  - a `netlify.*` file in the `repositoryRoot`
//  - a `netlify.*` file in the current directory or any parent
const getConfigPath = async function(configFile, cwd, repositoryRoot) {
  if (configFile !== undefined) {
    return getLocalConfig(configFile, cwd)
  }

  const configPath = await searchConfigFile(repositoryRoot)
  if (configPath !== undefined) {
    return configPath
  }

  const configPathA = await findUp(FILENAMES, { cwd })
  return configPathA
}

const getLocalConfig = async function(configFile, cwd) {
  const configPath = resolve(cwd, configFile)

  if (!(await pathExists(configPath))) {
    throwError(`Configuration file does not exist: ${configPath}`)
  }

  return configPath
}

const searchConfigFile = async function(cwd) {
  const filenames = FILENAMES.map(filename => resolve(cwd, filename))
  const configPath = await locatePath(filenames)
  return configPath
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json']

module.exports = { getConfigPath }
