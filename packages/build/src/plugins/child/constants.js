const { relative, normalize } = require('path')
const { tmpdir } = require('os')
const {
  env: { DEPLOY_ID },
} = require('process')

const mapObj = require('map-obj')

const isNetlifyCI = require('../../utils/is-netlify-ci')
const { getCacheDir } = require('../../cache/dir.js')

// Retrieve constants passed to plugins
const getConstants = async function({
  configPath,
  baseDir,
  config: {
    build: { publish, functions },
  },
}) {
  const cacheDir = await getCacheDir()
  const functionsDist = getFunctionsDist()

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
     * The directory files can be cached in between builds
     */
    CACHE_DIR: cacheDir,
    /**
     * The directory where function source code lives
     */
    FUNCTIONS_SRC: functions,
    /**
     * The directory where built serverless functions are placed before deployment
     */
    FUNCTIONS_DIST: functionsDist,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, baseDir)])
  return constantsA
}

const getFunctionsDist = function() {
  if (isNetlifyCI()) {
    return `${tmpdir()}/zisi-${DEPLOY_ID}`
  }

  return LOCAL_FUNCTIONS_DIST
}

const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'

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
