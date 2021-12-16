import filterObj from 'filter-obj'

import { simplifyConfig } from '../simplify.js'

// Make sure we are not printing secret values. Use an allow list.
export const cleanupConfig = function ({
  build: {
    base,
    command,
    commandOrigin,
    environment = {},
    edge_handlers: edgeHandlers,
    ignore,
    processing,
    publish,
    publishOrigin,
  } = {},
  headers,
  headersOrigin,
  plugins = [],
  redirects,
  redirectsOrigin,
  baseRelDir,
  functions,
  functionsDirectory,
}) {
  const environmentA = cleanupEnvironment(environment)
  const build = {
    base,
    command,
    commandOrigin,
    environment: environmentA,
    edge_handlers: edgeHandlers,
    ignore,
    processing,
    publish,
    publishOrigin,
  }
  const pluginsA = plugins.map(cleanupPlugin)
  const netlifyConfig = simplifyConfig({
    build,
    plugins: pluginsA,
    headers,
    headersOrigin,
    redirects,
    redirectsOrigin,
    baseRelDir,
    functions,
    functionsDirectory,
  })
  return netlifyConfig
}

export const cleanupEnvironment = function (environment) {
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
