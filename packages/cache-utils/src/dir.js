const { platform, env } = require('process')
const { resolve } = require('path')

const globalCacheDir = require('global-cache-dir')

const isNetlifyCI = require('./utils/is-netlify-ci')

// Retrieve the cache directory location
const getCacheDir = function(cacheDir) {
  if (cacheDir !== undefined) {
    return resolve(cacheDir)
  }

  if (!isNetlifyCI()) {
    return resolve(LOCAL_CACHE_DIR)
  }

  // Do not use in tests since /opt might not be writable by current user
  if (platform === 'linux' && !env.NETLIFY_BUILD_TEST) {
    return CI_CACHE_DIR
  }

  return globalCacheDir(PROJECT_NAME)
}

const LOCAL_CACHE_DIR = '.netlify/cache/'
const CI_CACHE_DIR = '/opt/build/cache/'
const PROJECT_NAME = 'netlify-build'

module.exports = { getCacheDir }
