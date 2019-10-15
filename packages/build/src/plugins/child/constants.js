const { resolve } = require('path')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = function(configPath, config) {
  const buildDir = getBuildDir(config)
  const cacheDir = getCacheDir()
  return { CONFIG_PATH: configPath, CACHE_DIR: cacheDir, BUILD_DIR: buildDir }
}

const getBuildDir = function({ build: { publish } }) {
  if (publish !== undefined) {
    return resolve(publish)
  }

  return resolve('.netlify', 'build')
}

const getCacheDir = function() {
  if (isNetlifyCI()) {
    return '/opt/build/cache'
  }

  return resolve('.netlify', 'cache')
}

module.exports = { getConstants }
