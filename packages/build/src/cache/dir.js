const {
  platform,
  env: { CACHE_BASE },
} = require('process')

const globalCacheDir = require('global-cache-dir')

const isNetlifyCI = require('../utils/is-netlify-ci')

// Retrieve cache directory
const getCacheDir = function() {
  if (!isNetlifyCI()) {
    return LOCAL_CACHE_DIR
  }

  // istanbul ignore next
  // Do not use in tests since /opt might not be writable by current user
  if (platform === 'linux' && CACHE_BASE === undefined) {
    return CI_CACHE_DIR
  }

  return globalCacheDir(PROJECT_NAME)
}

const LOCAL_CACHE_DIR = '.netlify/cache/'
const CI_CACHE_DIR = '/opt/build/cache/'
const PROJECT_NAME = 'netlify-build'

module.exports = { getCacheDir }
