const { relative, normalize } = require('path')
const { tmpdir } = require('os')
const {
  env: { DEPLOY_ID },
} = require('process')

const mapObj = require('map-obj')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = function({
  configPath,
  baseDir,
  netlifyConfig: {
    build: { publish, functions = DEFAULT_FUNCTIONS },
  },
}) {
  const functionsDist = getFunctionsDist()
  const cacheDir = getCacheDir()

  const constants = {
    /**
     * Path to the netlify configuration file
     */
    CONFIG_PATH: configPath,
    /**
     * The build directory of the site
     */
    BUILD_DIR: publish,
    /**
     * The directory where function source code lives
     */
    FUNCTIONS_SRC: functions,
    /**
     * The directory where built serverless functions are placed before deployment
     */
    FUNCTIONS_DIST: functionsDist,
    CACHE_DIR: cacheDir,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, baseDir)])
  return constantsA
}

const DEFAULT_FUNCTIONS = 'functions'
const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'
const getFunctionsDist = function() {
  if (isNetlifyCI()) {
    return `${tmpdir()}/zisi-${DEPLOY_ID}`
  }

  return LOCAL_FUNCTIONS_DIST
}

const CI_CACHE_DIR = '/opt/build/cache/'
const LOCAL_CACHE_DIR = '.netlify/cache/'
const getCacheDir = function() {
  if (isNetlifyCI()) {
    return CI_CACHE_DIR
  }

  return LOCAL_CACHE_DIR
}

// The current directory is `baseDir`. Most constants are inside this `baseDir`.
// Instead of passing absolute paths, we pass paths relative to `baseDir`, so
// that logs are less verbose.
const normalizePath = function(path, baseDir) {
  if (path === undefined) {
    return path
  }

  const pathA = normalize(path)

  if (pathA.startsWith(baseDir)) {
    return relative(baseDir, pathA)
  }

  return pathA
}

module.exports = { getConstants }
