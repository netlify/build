const { resolve } = require('path')
const { tmp } = require('os')
const {
  env: { DEPLOY_ID },
} = require('process')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Retrieve constants passed to plugins
const getConstants = function({
  configPath,
  baseDir,
  config,
  config: {
    build: { publish, functions },
  },
}) {
  const cacheDir = getCacheDir(baseDir)
  const functionsDist = getFunctionsDist(baseDir)
  return {
    CONFIG_PATH: configPath,
    BUILD_DIR: publish,
    FUNCTIONS_SRC: functions,
    FUNCTIONS_DIST: functionsDist,
    CACHE_DIR: cacheDir,
  }
}

const getCacheDir = function(baseDir) {
  if (isNetlifyCI()) {
    return CI_CACHE_DIR
  }

  return resolve(baseDir, LOCAL_CACHE_DIR)
}

const CI_CACHE_DIR = '/opts/build/cache/'
const LOCAL_CACHE_DIR = '.netlify/cache/'

const getFunctionsDist = function(baseDir) {
  if (isNetlifyCI()) {
    return `${tmp()}/zisi-${DEPLOY_ID}`
  }

  return resolve(baseDir, LOCAL_FUNCTIONS_DIST)
}

const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'

module.exports = { getConstants }
