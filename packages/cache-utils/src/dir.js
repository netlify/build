'use strict'

const { resolve } = require('path')

// Retrieve the cache directory location
const getCacheDir = function ({ cacheDir = DEFAULT_CACHE_DIR, cwd = '.' } = {}) {
  return resolve(cwd, cacheDir)
}

const DEFAULT_CACHE_DIR = '.netlify/cache/'

module.exports = { getCacheDir }
