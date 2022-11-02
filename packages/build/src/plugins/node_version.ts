import { execPath, version as currentVersion } from 'process'

import semver from 'semver'

// This node version is minimum required to use ESModules so if the user's preferred Node.js version is below that
// we have to fall back to the system node version
const MINIMUM_REQUIRED_NODE_VERSION = '^12.20.0 || ^14.14.0 || >=16.0.0'

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
    semver.satisfies(userNodeVersion, MINIMUM_REQUIRED_NODE_VERSION)
    ? { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }
    : { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
}
