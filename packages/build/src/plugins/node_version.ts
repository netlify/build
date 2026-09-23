import { execPath, version as currentVersion } from 'process'

import type { PackageJson } from 'read-package-up'
import semver from 'semver'
import link from 'terminal-link'

import { type Logs, logWarning, logWarningSubHeader } from '../log/logger.js'

export type PluginsLoadedFrom = 'auto_install' | 'core' | 'local' | 'package.json'

export type PluginsOptions = {
  packageName: string
  pluginPath?: string | undefined
  pinnedVersion?: string | undefined
  // Extensions' build plugins are only `local` when developed locally, and have no `origin` nor `inputs`
  loadedFrom: PluginsLoadedFrom | undefined
  origin?: string | undefined
  inputs?: Record<string, unknown> | undefined
  pluginPackageJson?: PackageJson | undefined
}

export type NodeVersionOptions = { nodePath: string; nodeVersion: string }

/**
 * This node version is minimum required to run the plugins code.
 * If the users preferred Node.js version is below that we have to fall back to the system node version
 */
const MINIMUM_REQUIRED_NODE_VERSION = '>=22.12.0'

/**
 * Local plugins and `package.json`-installed plugins use user's preferred Node.js version if higher than our minimum
 * supported version. Else default to the system Node version.
 * Local and programmatic builds use `@netlify/build` Node.js version, which is
 * usually the system's Node.js version.
 * If the user Node version does not satisfy our supported engine range use our own system Node version
 */
export const addPluginsNodeVersion = function <T extends PluginsOptions>({
  pluginsOptions,
  nodePath,
  userNodeVersion,
  logs,
}: {
  pluginsOptions: T[]
  nodePath: string
  userNodeVersion: string
  logs: Logs | undefined
}): Promise<(T & NodeVersionOptions)[]> {
  // Unreachable fallback: `process.version` is always a valid version
  const currentNodeVersion = semver.clean(currentVersion) ?? currentVersion
  return Promise.resolve(
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

const addPluginNodeVersion = function <T extends PluginsOptions>({
  pluginOptions,
  pluginOptions: { loadedFrom, packageName },
  currentNodeVersion,
  userNodeVersion,
  nodePath,
  logs,
}: {
  pluginOptions: T
  currentNodeVersion: string
  userNodeVersion: string
  nodePath: string
  logs: Logs | undefined
}): T & NodeVersionOptions {
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
    'https://answers.netlify.com/t/build-plugins-end-of-support-for-node-js-18-node-js-20/162662',
  )}`,
  )

  return systemNode
}
