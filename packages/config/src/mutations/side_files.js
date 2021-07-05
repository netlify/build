'use strict'

const { resolve } = require('path')

const pFilter = require('p-filter')
const pathExists = require('path-exists')

// List all the files used for configuration besides `netlify.toml`.
// This is useful when applying configuration mutations since those files
// sometimes have higher priority and should therefore be deleted in order to
// apply any configuration update on `netlify.toml`.
const listConfigSideFiles = async function ({ build: { publish } }, buildDir) {
  const publishSideFiles = PUBLISH_SIDE_FILES.map((publishSideFile) => resolve(buildDir, publish, publishSideFile))
  const configSideFiles = await pFilter(publishSideFiles, pathExists)
  // eslint-disable-next-line fp/no-mutating-methods
  return configSideFiles.sort()
}

const PUBLISH_SIDE_FILES = ['_redirects']

module.exports = { listConfigSideFiles }
