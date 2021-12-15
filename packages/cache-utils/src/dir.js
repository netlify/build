import { resolve } from 'path'

// Retrieve the cache directory location
export const getCacheDir = function ({ cacheDir = DEFAULT_CACHE_DIR, cwd = '.' } = {}) {
  return resolve(cwd, cacheDir)
}

const DEFAULT_CACHE_DIR = '.netlify/cache/'
