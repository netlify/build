const { resolve, basename } = require('path')

const findUp = require('find-up')
const pFilter = require('p-filter')
const pLocate = require('p-locate')
const pathExists = require('path-exists')

const { throwError } = require('./error')
const { resolvePath } = require('./files')

// Configuration location can be:
//  - a local path with the --config CLI flag
//  - a `netlify.*` file in the `repositoryRoot/{base}`
//  - a `netlify.*` file in the `repositoryRoot`
//  - a `netlify.*` file in the current directory or any parent
const getConfigPath = async function({ configOpt, cwd, repositoryRoot, base }) {
  const configPath = await pLocate(
    [
      searchConfigOpt(cwd, configOpt),
      searchBaseConfigFile(repositoryRoot, base),
      searchConfigFile(repositoryRoot),
      findUp(FILENAMES, { cwd }),
    ],
    Boolean,
  )
  return configPath
}

// --config CLI flag
const searchConfigOpt = function(cwd, configOpt) {
  if (configOpt === undefined) {
    return
  }

  return resolve(cwd, configOpt)
}

// Look for `repositoryRoot/{base}/netlify.*`
const searchBaseConfigFile = function(repositoryRoot, base) {
  if (base === undefined) {
    return
  }

  const basePath = resolvePath(repositoryRoot, base)
  return searchConfigFile(basePath)
}

// Look for several file extensions for `netlify.*`
const searchConfigFile = async function(cwd) {
  const paths = FILENAMES.map(filename => resolve(cwd, filename))
  const pathsA = await pFilter(paths, pathExists)

  if (pathsA.length > 1) {
    const filenames = pathsA.map(path => basename(path)).join(', ')
    throwError(`Should use only one configuration file (among ${filenames}) in:\n${cwd}`)
  }

  return pathsA[0]
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json']

module.exports = { getConfigPath }
