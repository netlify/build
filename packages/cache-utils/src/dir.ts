import { resolve } from 'path'

const DEFAULT_CACHE_DIR = '.netlify/cache/'

// Retrieve the cache directory location
export const getCacheDir = function ({ cacheDir = DEFAULT_CACHE_DIR, cwd = '.' } = {}) {
  return resolve(cwd, cacheDir)
}
