const { tmpdir } = require('os')
const { relative, normalize } = require('path')

const { getCacheDir } = require('@netlify/cache-utils')
const mapObj = require('map-obj')

const { version } = require('../../package.json')

// Retrieve constants passed to plugins
const getConstants = async function({
  configPath,
  buildDir,
  functionsDistDir,
  netlifyConfig: {
    build: { publish = buildDir, functions },
  },
  siteInfo: { id: siteId },
  deployId,
  mode,
}) {
  const isLocal = mode !== 'buildbot'
  const functionsDist = getFunctionsDist(functionsDistDir, isLocal, deployId)
  const cacheDir = await getCacheDir({ mode })

  const constants = {
    /**
     * Path to the Netlify configuration file
     */
    CONFIG_PATH: configPath,
    /**
     * Directory that contains the deploy-ready HTML files and assets generated by the build
     */
    PUBLISH_DIR: publish,
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
     * The version of Netlify Build
     */
    NETLIFY_BUILD_VERSION: version,
    /**
     * The Netlify Site ID
     */
    SITE_ID: siteId,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, buildDir, key)])
  return constantsA
}

const LOCAL_FUNCTIONS_DIST = '.netlify/functions/'
const getFunctionsDist = function(functionsDistDir, isLocal, deployId) {
  if (functionsDistDir && functionsDistDir != '') {
    return functionsDistDir
  }

  if (isLocal) {
    return LOCAL_FUNCTIONS_DIST
  }

  return `${tmpdir()}/zisi-${deployId}`
}

// The current directory is `buildDir`. Most constants are inside this `buildDir`.
// Instead of passing absolute paths, we pass paths relative to `buildDir`, so
// that logs are less verbose.
const normalizePath = function(path, buildDir, key) {
  if (path === undefined || NOT_PATHS.includes(key)) {
    return path
  }

  const pathA = normalize(path)

  if (pathA.startsWith(buildDir) && pathA !== buildDir) {
    return relative(buildDir, pathA)
  }

  return pathA
}

const NOT_PATHS = ['IS_LOCAL', 'NETLIFY_BUILD_VERSION', 'SITE_ID']

module.exports = { getConstants }
