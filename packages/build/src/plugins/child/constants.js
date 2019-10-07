const { resolve } = require('path')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = function(configPath, config, baseDir) {
  const buildDir = getBuildDir(config, baseDir)
  const cacheDir = getCacheDir(baseDir)
  return { CONFIG_PATH: configPath, CACHE_DIR: cacheDir, BUILD_DIR: buildDir }
}

const getBuildDir = function({ build: { publish } }, baseDir) {
  if (publish !== undefined) {
    return resolve(publish)
  }

  return resolve(baseDir, '.netlify', 'build')
}

const getCacheDir = function(baseDir) {
  if (isNetlifyCI()) {
    return '/opt/build/cache'
  }

  return resolve(baseDir, '.netlify', 'cache')
}

module.exports = { getConstants }
