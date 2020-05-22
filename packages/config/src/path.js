const { resolve } = require('path')

const findUp = require('find-up')
const pLocate = require('p-locate')
const pathExists = require('path-exists')

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
      findUp(FILENAME, { cwd }),
    ],
    Boolean,
  )
  await printDeprecatedYaml(configPath, repositoryRoot)
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
  const path = resolve(cwd, FILENAME)
  if (!(await pathExists(path))) {
    return
  }
  return path
}

const FILENAME = 'netlify.toml'

// TODO: remove once users stop using netlify.yml
const printDeprecatedYaml = async function(configPath, repositoryRoot) {
  if (configPath !== undefined) {
    return
  }

  const yamlConfigPath = await findUp(YAML_FILENAME, { cwd: repositoryRoot })
  if (yamlConfigPath !== undefined) {
    throw new Error(`${YAML_FILENAME} is deprecated: please use ${FILENAME} instead.`)
  }
}

const YAML_FILENAME = 'netlify.yml'

module.exports = { getConfigPath }
