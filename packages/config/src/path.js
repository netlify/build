'use strict'

const { resolve } = require('path')

const findUp = require('find-up')
const pLocate = require('p-locate')
const pathExists = require('path-exists')

// Configuration location can be:
//  - a local path with the --config CLI flag
//  - a `netlify.*` file in the `repositoryRoot/{base}`
//  - a `netlify.*` file in the `repositoryRoot`
//  - a `netlify.*` file in the current directory or any parent
const getConfigPath = async function ({ configOpt, cwd, repositoryRoot, configBase }) {
  const configPath = await pLocate(
    [
      searchConfigOpt(cwd, configOpt),
      searchBaseConfigFile(repositoryRoot, configBase),
      searchConfigFile(repositoryRoot),
      findUp(FILENAME, { cwd }),
    ],
    Boolean,
  )
  return configPath
}

// --config CLI flag
const searchConfigOpt = function (cwd, configOpt) {
  if (configOpt === undefined) {
    return
  }

  return resolve(cwd, configOpt)
}

// Look for `repositoryRoot/{base}/netlify.*`
const searchBaseConfigFile = function (repositoryRoot, configBase) {
  if (configBase === undefined) {
    return
  }

  return searchConfigFile(configBase)
}

// Look for several file extensions for `netlify.*`
const searchConfigFile = async function (cwd) {
  const path = resolve(cwd, FILENAME)
  if (!(await pathExists(path))) {
    return
  }
  return path
}

const FILENAME = 'netlify.toml'

module.exports = { getConfigPath }
