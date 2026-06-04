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
const MINIMUM_REQUIRED_NODE_VERSION = '>=18.14.0'
const UPCOMING_MINIMUM_REQUIRED_NODE_VERSION = '>=22.12.0'

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
    logWarningSubHeader(
      logs,
      `Warning: Starting June 16, 2026 plugin "${packageName}" will be executed with Node.js version 22.`,
    )
    logWarning(
      logs,
      `  We're upgrading our system Node.js minimum on that day, which means the plugin cannot be executed with your defined Node.js version ${userNodeVersion}.

  Please make sure your plugin supports being run on Node.js 22.

  Read more about our minimum required version in our ${link(
    'forums announcement',
    'https://answers.netlify.com/t/build-plugins-end-of-support-for-node-js-18-node-js-20/162662',
  )}`,
    )

    if (pluginPath) {
      const pluginDir = dirname(pluginPath)
      const { packageJson: pluginPackageJson, packageDir } = await getPackageJson(pluginDir)

      // `getPackageJson` walks up to the nearest `package.json`. For a `package.json`-installed
      // plugin that's the plugin's own manifest, but for a local single-file plugin
      // (e.g. `./plugins/foo.js`) it resolves an ancestor — typically the *site's*
      // `package.json`, whose `engines.node` describes the site rather than the plugin. Only
      // trust the resolved range when the manifest belongs to the plugin: an installed package,
      // or a local plugin shipping its own `package.json` alongside its entry file.
      const pluginOwnsPackageJson = loadedFrom === 'package.json' || packageDir === pluginDir
      const pluginNodeVersionRange = pluginOwnsPackageJson ? pluginPackageJson.engines?.node : undefined

      // Ensure Node.js version is compatible with plugin's `engines.node`
      if (!pluginOwnsPackageJson) {
        systemLog(`plugin "${packageName}" node support range could not be determined (no own package.json)`)
      } else if (!pluginNodeVersionRange) {
        systemLog(`plugin "${packageName}" does not specify node support range`)
      } else if (semver.satisfies('22.12.0', pluginNodeVersionRange)) {
        systemLog(`plugin "${packageName}" node support range includes v22`)
      } else {
        logWarning(
          logs,
          `  In its package.json, the plugin "${packageName}" declares a Node.js version range ("${pluginNodeVersionRange}") that does not include Node.js 22. Please upgrade the plugin so it can be run on Node.js 22.`,
        )
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
    'https://answers.netlify.com/t/build-plugins-end-of-support-for-node-js-18-node-js-20/162662',
  )}`,
  )

  return systemNode
}
