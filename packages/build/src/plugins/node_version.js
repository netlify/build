import { version as currentVersion, execPath } from 'process'

import semver from 'semver'

import { addErrorInfo } from '../error/info.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

// Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
// supported version. Else default to the system Node version.
// Local and programmatic builds use `@netlify/build` Node.js version, which is
// usually the system's Node.js version.
// If the user Node version does not satisfy our supported engine range use our own system Node version
export const addPluginsNodeVersion = function ({ pluginsOptions, nodePath, userNodeVersion }) {
  const currentNodeVersion = semver.clean(currentVersion)
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
    semver.satisfies(userNodeVersion, ROOT_PACKAGE_JSON.engines.node)
    ? { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
    : { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
}

// Ensure Node.js version is compatible with plugin's `engines.node`
export const checkNodeVersion = function ({
  nodeVersion,
  packageName,
  pluginPackageJson: { engines: { node: pluginNodeVersionRange } = {} } = {},
}) {
  if (pluginNodeVersionRange && !semver.satisfies(nodeVersion, pluginNodeVersionRange)) {
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
