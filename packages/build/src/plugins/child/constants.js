const { relative } = require('path')
const { tmpdir } = require('os')
const {
  env: { DEPLOY_ID },
} = require('process')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = function({
  configPath,
  baseDir,
  config: {
    build: { publish, functions },
  },
}) {
  const configPathA = normalizePath(configPath, baseDir)
  const publishA = normalizePath(publish, baseDir)
  const cacheDir = getCacheDir()
  const functionsSrc = normalizePath(functions, baseDir)
  const functionsDist = getFunctionsDist()

  return {
    /**
     * Path to the netlify configuration file
     */
    CONFIG_PATH: configPathA,
    /**
     * The build directory of the site
     */
    BUILD_DIR: publishA,
    /**
     * The directory files can be cached in between builds
     */
    CACHE_DIR: cacheDir,
    /**
     * The directory where function source code lives
     */
    FUNCTIONS_SRC: functionsSrc,
    /**
     * The directory where built serverless functions are placed before deployment
     */
    FUNCTIONS_DIST: functionsDist,
  }
}

// The current directory is `baseDir`. Most constants are inside this `baseDir`.
// Instead of passing absolute paths, we pass paths relative to `baseDir`, so
// that logs are less verbose.
const normalizePath = function(path, baseDir) {
  if (path === undefined) {
    return
  }

  return relative(baseDir, path)
}

const getCacheDir = function() {
  if (isNetlifyCI()) {
    return CI_CACHE_DIR
  }

  return LOCAL_CACHE_DIR
}

const CI_CACHE_DIR = '/opt/build/cache/'
const LOCAL_CACHE_DIR = '.netlify/cache/'

const getFunctionsDist = function() {
  if (isNetlifyCI()) {
    return `${tmpdir()}/zisi-${DEPLOY_ID}`
  }

  return LOCAL_FUNCTIONS_DIST
}

const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'

module.exports = { getConstants }
