const {
  platform,
  env: { TEST_CACHE_PATH },
} = require('process')

const globalCacheDir = require('global-cache-dir')

const { isNetlifyCI } = require('./ci')

// Retrieve the cache directory location
const getCacheDir = function() {
  if (!isNetlifyCI()) {
    return LOCAL_CACHE_DIR
  }

  // istanbul ignore next
  // Do not use in tests since /opt might not be writable by current user
  if (platform === 'linux' && TEST_CACHE_PATH === undefined) {
    return CI_CACHE_DIR
  }

  return globalCacheDir(PROJECT_NAME)
}

const LOCAL_CACHE_DIR = '.netlify/cache/'
const CI_CACHE_DIR = '/opt/build/cache/'
const PROJECT_NAME = 'netlify-build'

module.exports = { getCacheDir }
