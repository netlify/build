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
  siteInfo: { id: siteId },
}) {
  const isLocal = !isNetlifyCI()
  const functionsDist = getFunctionsDist(isLocal)
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
     * Path to the Netlify build cache folder
     */
    CACHE_DIR: cacheDir,
    /**
     * Boolean indicating whether the build was run locally (Netlify CLI) or in the production CI
     */
    IS_LOCAL: isLocal,
    /**
     * The Netlify Site ID
     */
    SITE_ID: siteId,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, baseDir, key)])
  return constantsA
}

const DEFAULT_FUNCTIONS = 'functions'
const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'
const getFunctionsDist = function(isLocal) {
  if (isLocal) {
    return LOCAL_FUNCTIONS_DIST
  }

  return `${tmpdir()}/zisi-${DEPLOY_ID}`
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

const NOT_PATHS = ['IS_LOCAL', 'SITE_ID']

module.exports = { getConstants }
