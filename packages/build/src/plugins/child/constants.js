const { resolve } = require('path')
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
  const cacheDir = getCacheDir(baseDir)
  const functionsDist = getFunctionsDist(baseDir)
  return {
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
}

const getCacheDir = function(baseDir) {
  if (isNetlifyCI()) {
    return CI_CACHE_DIR
  }

  return resolve(baseDir, LOCAL_CACHE_DIR)
}

const CI_CACHE_DIR = '/opt/build/cache/'
const LOCAL_CACHE_DIR = '.netlify/cache/'

const getFunctionsDist = function(baseDir) {
  if (isNetlifyCI()) {
    return `${tmpdir()}/zisi-${DEPLOY_ID}`
  }

  return resolve(baseDir, LOCAL_FUNCTIONS_DIST)
}

const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'

module.exports = { getConstants }
