'use strict'

const { version: currentVersion, execPath } = require('process')

const { satisfies, clean: cleanVersion } = require('semver')

const {
  engines: { node: nodeVersionSupportedRange },
} = require('../../package.json')
const { addErrorInfo } = require('../error/info')

// Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
// supported version (Node v10). Else default to the system Node version.
// Local and programmatic builds use `@netlify/build` Node.js version, which is
// usually the system's Node.js version.
// If the user Node version does not satisfy our supported engine range use our own system Node version
const addPluginsNodeVersion = function ({ pluginsOptions, nodePath, userNodeVersion }) {
  const currentNodeVersion = cleanVersion(currentVersion)
  return pluginsOptions.map((pluginOptions) =>
    addPluginNodeVersion({ pluginOptions, currentNodeVersion, userNodeVersion, nodePath }),
  )
}

const addPluginNodeVersion = function ({
  pluginOptions,
  pluginOptions: { loadedFrom },
  currentNodeVersion,
  userNodeVersion,
  nodePath,
}) {
  return (loadedFrom === 'local' || loadedFrom === 'package.json') &&
    satisfies(userNodeVersion, nodeVersionSupportedRange)
    ? { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
    : { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
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
