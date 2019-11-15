const { resolve } = require('path')

const isNetlifyCI = require('../utils/is-netlify-ci')

// Retrieve cache directory
const getCacheDir = function(baseDir) {
  if (isNetlifyCI()) {
    return CI_CACHE_DIR
  }

  return resolve(baseDir, LOCAL_CACHE_DIR)
}

const CI_CACHE_DIR = '/opt/build/cache/'
const LOCAL_CACHE_DIR = '.netlify/cache/'

module.exports = { getCacheDir }
