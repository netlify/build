import { dirname } from 'path'
import { execPath, version as currentVersion } from 'process'

import semver from 'semver'
import link from 'terminal-link'

import { logWarning, logWarningSubHeader } from '../log/logger.js'
import { getPackageJson } from '../utils/package.js'

export type PluginsLoadedFrom = 'auto_install' | 'local' | 'package.json'

export type PluginsOptions = {
  packageName: string
  pluginPath?: any
  pinnedVersion?: any
  loadedFrom: PluginsLoadedFrom
  origin: 'config' | string
  inputs: Record<string, any>
  pluginPackageJson?: Record<string, any>
}

/**
 * This node version is minimum required to run the plugins code.
 * If the users preferred Node.js version is below that we have to fall back to the system node version
 */
const MINIMUM_REQUIRED_NODE_VERSION = '^14.14.0 || >=16.0.0'
const UPCOMING_MINIMUM_REQUIRED_NODE_VERSION = '>=18.14.0'

/**
 * Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
 * supported version. Else default to the system Node version.
 * Local and programmatic builds use `@netlify/build` Node.js version, which is
 * usually the system's Node.js version.
 * If the user Node version does not satisfy our supported engine range use our own system Node version
 */
export const addPluginsNodeVersion = function ({
  featureFlags,
  pluginsOptions,
  nodePath,
  userNodeVersion,
  logs,
  systemLog,
}) {
  const currentNodeVersion = semver.clean(currentVersion)
  return Promise.all(
    pluginsOptions.map((pluginOptions) =>
      addPluginNodeVersion({
        featureFlags,
        pluginOptions,
        currentNodeVersion,
        userNodeVersion,
        nodePath,
        logs,
        systemLog,
      }),
    ),
  )
}

const addPluginNodeVersion = async function ({
  featureFlags,
  pluginOptions,
  pluginOptions: { loadedFrom, packageName, pluginPath },
  currentNodeVersion,
  userNodeVersion,
  nodePath,
  logs,
  systemLog,
}: {
  pluginOptions: PluginsOptions
  [key: string]: any
}) {
  const systemNode = { ...pluginOptions, nodePath: execPath, nodeVersion: currentNodeVersion }
  const userNode = { ...pluginOptions, nodePath, nodeVersion: userNodeVersion }

  const isLocalPlugin = loadedFrom === 'local' || loadedFrom === 'package.json'

  const isUIOrAutoInstalledPlugin = !isLocalPlugin
  if (isUIOrAutoInstalledPlugin) {
    return systemNode
  }

  if (
    featureFlags.build_warn_upcoming_system_version_change &&
    !semver.satisfies(userNodeVersion, UPCOMING_MINIMUM_REQUIRED_NODE_VERSION)
  ) {
    if (pluginPath) {
      const pluginDir = dirname(pluginPath)
      const { packageJson: pluginPackageJson } = await getPackageJson(pluginDir)

      // Ensure Node.js version is compatible with plugin's `engines.node`
      const pluginNodeVersionRange = pluginPackageJson?.engines?.node
      if (!pluginNodeVersionRange) {
        systemLog(`plugin "${packageName}" does not specify node support range`)
      } else if (semver.satisfies('22.0.0', pluginNodeVersionRange)) {
        systemLog(`plugin "${packageName}" node support range includes v22`)
      } else {
        systemLog(`plugin "${packageName}" node support range does NOT include v22`)
      }
    } else {
      systemLog(`plugin "${packageName}" pluginPath not available`)
    }
  }

  if (semver.satisfies(userNodeVersion, MINIMUM_REQUIRED_NODE_VERSION)) {
    return userNode
  }

  logWarningSubHeader(logs, `Warning: ${packageName} will be executed with Node.js version ${currentNodeVersion}`)
  logWarning(
    logs,
    `  The plugin cannot be executed with your defined Node.js version ${userNodeVersion}

  Read more about our minimum required version in our ${link(
    'forums announcement',
    'https://answers.netlify.com/t/build-plugins-dropping-support-for-node-js-12/79421',
  )}`,
  )

  return systemNode
}
