'use strict'

const { version: currentVersion, execPath } = require('process')

const { satisfies, clean: cleanVersion } = require('semver')

const {
  engines: { node: coreNodeVersionRange },
} = require('../../package.json')
const { addErrorInfo } = require('../error/info')

// Local plugins, `package.json`-installed plugins and local builds use user's
// preferred Node.js version.
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
  if (loadedFrom === 'local' || loadedFrom === 'package.json' || (loadedFrom !== 'core' && mode !== 'buildbot')) {
    return { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
  }

  return { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
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

module.exports = { addPluginsNodeVersion, checkNodeVersion }
