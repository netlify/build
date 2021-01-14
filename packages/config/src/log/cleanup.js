'use strict'

const filterObj = require('filter-obj')

const { removeFalsy } = require('../utils/remove_falsy')

const { removeEmptyObject, removeEmptyArray } = require('./remove')

// Make sure we are not printing secret values. Use an allow list.
const cleanupConfig = function ({
  build: {
    base,
    command,
    commandOrigin,
    environment = {},
    functions,
    edge_handlers: edgeHandlers,
    ignore,
    processing,
    publish,
  } = {},
  headers,
  plugins = [],
  redirects,
  baseRelDir,
}) {
  const environmentA = cleanupEnvironment(environment)
  const build = {
    base,
    command,
    commandOrigin,
    environment: environmentA,
    functions,
    edge_handlers: edgeHandlers,
    ignore,
    processing,
    publish,
  }
  const pluginsA = plugins.map(cleanupPlugin)
  const netlifyConfig = simplifyConfig({ build, plugins: pluginsA, headers, redirects, baseRelDir })
  return netlifyConfig
}

const cleanupEnvironment = function (environment) {
  return Object.keys(environment).filter((key) => !BUILDBOT_ENVIRONMENT.has(key))
}

// Added by the buildbot. We only want to print environment variables specified
// by the user.
const BUILDBOT_ENVIRONMENT = new Set([
  'BRANCH',
  'CONTEXT',
  'DEPLOY_PRIME_URL',
  'DEPLOY_URL',
  'GO_VERSION',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'SITE_ID',
  'SITE_NAME',
  'URL',
])

const cleanupPlugin = function ({ package: packageName, origin, inputs = {} }) {
  const inputsA = filterObj(inputs, isPublicInput)
  return { package: packageName, origin, inputs: inputsA }
}

const isPublicInput = function (key, input) {
  return typeof input === 'boolean'
}

// The resolved configuration gets assigned some default values (empty objects and arrays)
// to make it more convenient to use without checking for `undefined`.
// However those empty values are not useful to users, so we don't log them.
const simplifyConfig = function ({ build: { environment, ...build }, plugins, ...netlifyConfig }) {
  const buildA = {
    ...build,
    ...removeEmptyArray(environment, 'environment'),
  }
  return removeFalsy({
    ...netlifyConfig,
    ...removeEmptyObject(buildA, 'build'),
    ...removeEmptyArray(plugins, 'plugins'),
  })
}

module.exports = { cleanupConfig, cleanupEnvironment }
