import { execPath, version as currentVersion } from 'process'

import semver from 'semver'
import link from 'terminal-link'

import { logWarning, logWarningSubHeader } from '../log/logger.js'

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

/**
 * Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
 * supported version. Else default to the system Node version.
 * Local and programmatic builds use `@netlify/build` Node.js version, which is
 * usually the system's Node.js version.
 * If the user Node version does not satisfy our supported engine range use our own system Node version
 */
export const addPluginsNodeVersion = function ({ pluginsOptions, nodePath, userNodeVersion, logs }) {
  const currentNodeVersion = semver.clean(currentVersion)
  return Promise.all(
    pluginsOptions.map((pluginOptions) =>
      addPluginNodeVersion({
        pluginOptions,
        currentNodeVersion,
        userNodeVersion,
        nodePath,
        logs,
      }),
    ),
  )
}

const addPluginNodeVersion = async function ({
  pluginOptions,
  pluginOptions: { loadedFrom, packageName },
  currentNodeVersion,
  userNodeVersion,
  nodePath,
  logs,
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

  if (semver.satisfies(userNodeVersion, MINIMUM_REQUIRED_NODE_VERSION)) {
    return userNode
  }

  logWarningSubHeader(logs, `Warning: ${packageName} will be executed with Node.js version ${currentNodeVersion}`)
  logWarning(
    logs,
    `  The plugin cannot be executed with your defined Node.js version ${userNodeVersion}

  Read more about our minimum required version in our ${link(
    'forums announcement',
    'https://answers.netlify.com/t/build-plugins-end-of-support-for-node-js-14-node-js-16/136405',
  )}`,
  )

  return systemNode
}
