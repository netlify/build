const { relative, normalize } = require('path')
const { tmpdir } = require('os')
const {
  env: { DEPLOY_ID },
} = require('process')

const mapObj = require('map-obj')
const { getCacheDir } = require('@netlify/cache-utils')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = async function({
  configPath,
  baseDir,
  netlifyConfig: {
    build: { publish, functions = DEFAULT_FUNCTIONS },
  },
  siteId,
}) {
  const functionsDist = getFunctionsDist()
  const cacheDir = await getCacheDir()

  const constants = {
    /**
     * Path to the Netlify configuration file
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
    /**
     * The Netlify Site ID
     */
    SITE_ID: siteId,
    /**
     * Path to the Netlify build cache folder
     */
    CACHE_DIR: cacheDir,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, baseDir, key)])
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

// The current directory is `baseDir`. Most constants are inside this `baseDir`.
// Instead of passing absolute paths, we pass paths relative to `baseDir`, so
// that logs are less verbose.
const normalizePath = function(path, baseDir, key) {
  if (path === undefined || NOT_PATHS.includes(key)) {
    return path
  }

  const pathA = normalize(path)

  if (pathA.startsWith(baseDir)) {
    return relative(baseDir, pathA)
  }

  return pathA
}

const NOT_PATHS = ['SITE_ID']

module.exports = { getConstants }
