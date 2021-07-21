'use strict'

const { version: currentVersion, execPath } = require('process')

const { satisfies, clean: cleanVersion } = require('semver')

const { addErrorInfo } = require('../error/info')

// TODO rely on package.json.engines entry once the rollout is complete
const MINIMUM_NODE_VERSION_SUPPORTED = '10.18.0'

// Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
// supported version (Node v10). Else default to the system Node version.
// Local builds use user's preferred Node.js version.
// Other plugins use `@netlify/build` Node.js version.
const addPluginsNodeVersion = function ({ pluginsOptions, mode, nodePath, userNodeVersion }) {
  const currentNodeVersion = cleanVersion(currentVersion)
  return pluginsOptions.map((pluginOptions) =>
    addPluginNodeVersion({ pluginOptions, currentNodeVersion, userNodeVersion, mode, nodePath }),
  )
}

const addPluginNodeVersion = function ({
  pluginOptions,
  pluginOptions: { loadedFrom },
  currentNodeVersion,
  userNodeVersion,
  mode,
  nodePath,
}) {
  if (loadedFrom === 'local' || loadedFrom === 'package.json') {
    return nonUIPluginNodeVersion({ pluginOptions, currentNodeVersion, userNodeVersion, nodePath })
  }
  if (loadedFrom !== 'core' && mode !== 'buildbot') {
    return { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
  }

  return { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
}

const nonUIPluginNodeVersion = function ({ pluginOptions, currentNodeVersion, userNodeVersion, nodePath }) {
  if (satisfies(userNodeVersion, `<${MINIMUM_NODE_VERSION_SUPPORTED}`)) {
    return { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
  }
  return { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
}

// Ensure Node.js version is compatible with plugin's `engines.node`
const checkNodeVersion = function ({
  nodeVersion,
  packageName,
  pluginPackageJson: { engines: { node: pluginNodeVersionRange } = {} } = {},
}) {
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

module.exports = { addPluginsNodeVersion, checkNodeVersion }
