const { resolve, basename } = require('path')

const findUp = require('find-up')
const pathExists = require('path-exists')
const pFilter = require('p-filter')

const { throwError } = require('./error')

// Configuration location can be:
//  - a local path with the --config CLI flag
//  - a `netlify.*` file in the `repositoryRoot/{base}`
//  - a `netlify.*` file in the `repositoryRoot`
//  - a `netlify.*` file in the current directory or any parent
const getConfigPath = async function({ configOpt, cwd, repositoryRoot, base }) {
  if (configOpt !== undefined) {
    return resolve(cwd, configOpt)
  }

  if (base !== undefined) {
    const basePath = resolve(repositoryRoot, base)
    const configPath = await searchConfigFile(basePath)
    if (configPath !== undefined) {
      return configPath
    }
  }

  const configPathA = await searchConfigFile(repositoryRoot)
  if (configPathA !== undefined) {
    return configPathA
  }

  const configPathB = await findUp(FILENAMES, { cwd })
  return configPathB
}

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
