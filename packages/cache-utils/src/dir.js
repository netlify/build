const { resolve } = require('path')
const { platform, env } = require('process')

const globalCacheDir = require('global-cache-dir')

// Retrieve the cache directory location
const getCacheDir = function({ cacheDir, mode } = {}) {
  if (cacheDir !== undefined) {
    return resolve(cacheDir)
  }

  if (mode !== 'buildbot') {
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
