'use strict'

const { relative, normalize } = require('path')

const { getCacheDir } = require('@netlify/cache-utils')
const mapObj = require('map-obj')
const { isDirectory } = require('path-type')

const { version } = require('../../package.json')

// Retrieve constants passed to plugins
const getConstants = async function ({
  configPath,
  buildDir,
  functionsDistDir,
  netlifyConfig: {
    build: { publish = buildDir, functions, edge_handlers: edgeHandlers },
  },
  siteInfo: { id: siteId },
  token,
  mode,
  buildbotServerSocket,
}) {
  const isLocal = mode !== 'buildbot'
  const [cacheDir, edgeHandlersSrc] = await Promise.all([
    getCacheDir({ mode }),
    getEdgeHandlersSrc(edgeHandlers, buildDir),
  ])

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
    FUNCTIONS_DIST: functionsDistDir,
    /**
     * The directory where edge handlers source code lives
     */
    EDGE_HANDLERS_SRC: edgeHandlersSrc,
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
    /**
     * The Netlify API access token
     */
    NETLIFY_API_TOKEN: token,
    /**
     * The path to the buildbot server socket
     */
    BUILDBOT_SERVER_SOCKET: buildbotServerSocket,
  }
  const constantsA = mapObj(constants, (key, path) => [key, normalizePath(path, buildDir, key)])
  return constantsA
}

// The default `edge-handlers` is only set to `constants.EDGE_HANDLERS_SRC` if
// that directory exists
const getEdgeHandlersSrc = async function (edgeHandlers, buildDir) {
  if (edgeHandlers !== undefined) {
    return edgeHandlers
  }

  if (await isDirectory(`${buildDir}/${DEFAULT_EDGE_HANDLERS_SRC}`)) {
    return DEFAULT_EDGE_HANDLERS_SRC
  }
}

const DEFAULT_EDGE_HANDLERS_SRC = 'edge-handlers'

// The current directory is `buildDir`. Most constants are inside this `buildDir`.
// Instead of passing absolute paths, we pass paths relative to `buildDir`, so
// that logs are less verbose.
const normalizePath = function (path, buildDir, key) {
  if (path === undefined || !CONSTANT_PATHS.has(key)) {
    return path
  }

  const pathA = normalize(path)

  if (pathA.startsWith(buildDir) && pathA !== buildDir) {
    return relative(buildDir, pathA)
  }

  return pathA
}

const CONSTANT_PATHS = new Set([
  'CONFIG_PATH',
  'PUBLISH_DIR',
  'FUNCTIONS_SRC',
  'FUNCTIONS_DIST',
  'EDGE_HANDLERS_SRC',
  'CACHE_DIR',
])

module.exports = { getConstants }
