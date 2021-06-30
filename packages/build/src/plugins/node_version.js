'use strict'

const { version: currentVersion, execPath } = require('process')

const { satisfies, clean: cleanVersion } = require('semver')

const {
  engines: { node: coreNodeVersionRange },
} = require('../../package.json')
const { addErrorInfo } = require('../error/info')
const { logPluginNodeVersionWarning } = require('../log/messages/plugins')

// TODO rely on package.json.engines entry once the rollout is complete
const MINIMUM_NODE_VERSION_SUPPORTED = '10.18.0'

// Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
// supported version (Node v10). Else default to the system Node version.
// Local builds use user's preferred Node.js version.
// Other plugins use `@netlify/build` Node.js version.
const addPluginsNodeVersion = function ({ pluginsOptions, mode, nodePath, userNodeVersion, featureFlags }) {
  const currentNodeVersion = cleanVersion(currentVersion)
  return pluginsOptions.map((pluginOptions) =>
    addPluginNodeVersion({ pluginOptions, currentNodeVersion, userNodeVersion, mode, nodePath, featureFlags }),
  )
}

// We want to log a warning message for users relying on local or package.json installed plugins whose Node.js
// versions are lower than the system version we're currently relying (v12). This is part of our effort to decouple
// the Node.js versions our build system supports and the Node.js versions @netlify/build supports -
// https://github.com/netlify/pod-workflow/issues/219
const checkForOldNodeVersions = function ({ pluginsOptions, userNodeVersion, logs, mode }) {
  if (mode !== 'buildbot' || satisfies(userNodeVersion, `>=${MINIMUM_NODE_VERSION_SUPPORTED}`)) return

  const affectedPlugins = pluginsOptions
    // `expectedVersion` is only undefined when the plugin is not coming from our plugins directory, those are the cases
    // where we want to log the warning
    .filter(
      ({ loadedFrom, expectedVersion }) =>
        (loadedFrom === 'local' || loadedFrom === 'package.json') && expectedVersion === undefined,
    )
    .map(({ packageName }) => packageName)

  if (affectedPlugins.length === 0) return

  const currentNodeVersion = cleanVersion(currentVersion)
  logPluginNodeVersionWarning({ logs, pluginNames: affectedPlugins, userNodeVersion, currentNodeVersion })
}

const addPluginNodeVersion = function ({
  pluginOptions,
  pluginOptions: { loadedFrom },
  currentNodeVersion,
  userNodeVersion,
  mode,
  nodePath,
  featureFlags,
}) {
  if (loadedFrom === 'local' || loadedFrom === 'package.json') {
    return nonUIPluginNodeVersion({ pluginOptions, currentNodeVersion, userNodeVersion, nodePath, featureFlags })
  }
  if (loadedFrom !== 'core' && mode !== 'buildbot') {
    return { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
  }

  return { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
}

const nonUIPluginNodeVersion = function ({
  pluginOptions,
  currentNodeVersion,
  userNodeVersion,
  nodePath,
  featureFlags,
}) {
  // We want to slowly move node.js <10 plugin executions to use our system node version
  if (
    featureFlags.buildbot_build_plugins_system_node_version &&
    satisfies(userNodeVersion, `<${MINIMUM_NODE_VERSION_SUPPORTED}`)
  ) {
    return { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
  }
  return { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
}

// Ensure Node.js version is recent enough to run this plugin
const checkNodeVersion = function ({
  nodeVersion,
  packageName,
  pluginPackageJson: { engines: { node: pluginNodeVersionRange } = {} } = {},
}) {
  // Build plugins are instrumented with a wrapper code which has a minimal
  // allowed Node.js version.
  // A mismatch can only happen in the conditions described below since:
  //  - production builds use a pinned version, except for local plugins and
  //    plugins added to `package.json`
  //  - Netlify CLI has the same minimal allowed Node.js version as
  //    `@netlify/build`, so if users can run Netlify CLI, everything is good
  if (!satisfies(nodeVersion, coreNodeVersionRange)) {
    throwUserError(`The Node.js version is ${nodeVersion} but it should be ${coreNodeVersionRange} when using build plugins either:
  - from the same repository (as opposed to npm modules)
  - or added to "package.json"`)
  }

  // Plugins can also set a minimal version using `engines.node`
  if (pluginNodeVersionRange && !satisfies(nodeVersion, pluginNodeVersionRange)) {
    throwUserError(
      `The Node.js version is ${nodeVersion} but the plugin "${packageName}" requires ${pluginNodeVersionRange}`,
    )
  }
}

const throwUserError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

module.exports = { addPluginsNodeVersion, checkForOldNodeVersions, checkNodeVersion }
