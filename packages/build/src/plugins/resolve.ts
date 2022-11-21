import { existsSync, readdirSync } from 'fs'
import { createRequire } from 'module'
import { join } from 'path'

import { PackageJson } from 'read-pkg-up'

import type { Mode } from '../core/types.js'
import { addErrorInfo } from '../error/info.js'
import { installMissingPlugins } from '../install/missing.js'
import { resolvePath, tryResolvePath } from '../utils/resolve.js'

import { addExpectedVersions } from './expected_version.js'
import { addPluginsNodeVersion } from './node_version.js'
import type { PluginsOptions } from './options.js'
import { addPinnedVersions } from './pinned_version.js'

const AUTO_PLUGINS_DIR = '.netlify/plugins/'

/**
 * Find the path to the directory used to install plugins automatically.
 * It is a subdirectory of `buildDir`, so that the plugin can require the
 * project's dependencies (peer dependencies).
 */
const getAutoPluginsDir = (buildDir: string): string => `${buildDir}/${AUTO_PLUGINS_DIR}`

/**
 * Try to find plugins in four places, by priority order:
 * - already loaded (core plugins)
 * - local plugin
 * - external plugin already installed in `node_modules`, most likely through `package.json`
 * - automatically installed by us, to `.netlify/plugins/`
 */
export const resolvePluginsPath = async function ({
  pluginsOptions,
  siteInfo,
  buildDir,
  nodePath,
  packageJson,
  userNodeVersion,
  mode,
  api,
  logs,
  debug,
  sendStatus,
  testOpts,
  featureFlags,
}: {
  pluginsOptions: PluginsOptions[]
  buildDir: string
  nodePath: string
  packageJson: PackageJson
  userNodeVersion: string
  mode: Mode
  debug: boolean
  sendStatus: boolean
  featureFlags: Record<string, boolean>
  [key: string]: any
}) {
  const autoPluginsDir = getAutoPluginsDir(buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolvePluginPath({ pluginOptions, buildDir, autoPluginsDir })),
  )
  const pluginsOptionsB = addPluginsNodeVersion({
    pluginsOptions: pluginsOptionsA,
    nodePath,
    userNodeVersion,
    logs,
  } as any)
  const pluginsOptionsC = await addPinnedVersions({ pluginsOptions: pluginsOptionsB, api, siteInfo, sendStatus })
  const pluginsOptionsD = await addExpectedVersions({
    pluginsOptions: pluginsOptionsC,
    autoPluginsDir,
    packageJson,
    debug,
    logs,
    buildDir,
    testOpts,
    featureFlags,
  })
  const pluginsOptionsE = await handleMissingPlugins({
    pluginsOptions: pluginsOptionsD,
    autoPluginsDir,
    mode,
    logs,
  })
  return pluginsOptionsE
}

/**
 * Tries to resolve the plugin locally if the `loadedFrom` is not defined
 * - Core plugins have `loadedFrom` set to `undefined` so they are skipped
 * - If the `packageName` starts with a `./` we try to resolve it locally
 * - other than that we try to get it from the `package.json`
 * - if we cannot resolve it we fallback to `auto_install`
 *    - can happen if the plugin name got misspelled
 *    - is not in our official list
 *    - is in our official list but has not been installed by this site yet
 * @returns
 */
const resolvePluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, loadedFrom },
  buildDir,
  autoPluginsDir,
}: {
  pluginOptions: PluginsOptions
  buildDir: string
  autoPluginsDir: string
}) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  // Local plugins
  const localPackageName = normalizeLocalPackageName(packageName)
  if (localPackageName.startsWith('.')) {
    const { path: localPath, error } = await tryResolvePath(localPackageName, buildDir)
    // When requiring a local plugin with an invalid file path
    if (error !== undefined) {
      error.message = `Plugin could not be found using local path: ${localPackageName}\n${error.message}`
      addErrorInfo(error, { type: 'resolveConfig' })
      throw error
    }

    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Yarn Plug and play does not have node_modules anymore
  // It is required to load the .pnp.cjs and call the setup function otherwise resolving won't work anymore+
  // https://yarnpkg.com/features/pnp
  //
  // see https://github.com/netlify/build/issues/1535
  if (existsSync(join(buildDir, '.pnp.cjs'))) {
    const {
      default: { setup },
    } = await import(join(buildDir, '.pnp.cjs'))
    setup()
  }

  // Plugin added to `package.json`
  const { path: manualPath } = await tryResolvePath(packageName, buildDir)

  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath, loadedFrom: 'package.json' }
  }

  // Previously automatically installed
  const { path: automaticPath } = await tryResolvePath(packageName, autoPluginsDir)
  if (automaticPath !== undefined) {
    return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
  }

  // Happens if the plugin:
  //  - name is mispelled
  //  - is not in our official list
  //  - is in our official list but has not been installed by this site yet
  return { ...pluginOptions, loadedFrom: 'auto_install' }
}

/** Normalizes the `packageName` if it starts with `/` to be relative to the build directory */
const normalizeLocalPackageName = (packageName: string) => {
  if (packageName.startsWith('/')) {
    return `.${packageName}`
  }

  return packageName
}

// Install plugins from the official list that have not been previously installed.
// Print a warning if they have not been installed through the UI.
const handleMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, mode, logs }) {
  const missingPlugins = pluginsOptions.filter(isMissingPlugin)

  if (missingPlugins.length === 0) {
    return pluginsOptions
  }

  await installMissingPlugins({ missingPlugins, autoPluginsDir, mode, logs })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
}

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function ({ pluginOptions, pluginOptions: { packageName }, autoPluginsDir }) {
  if (!isMissingPlugin(pluginOptions as any)) {
    return pluginOptions
  }

  const pluginPath = await resolvePath(packageName, autoPluginsDir)
  return { ...pluginOptions, pluginPath }
}

const isMissingPlugin = function ({ isMissing }) {
  return isMissing
}
