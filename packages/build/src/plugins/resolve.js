import { join } from 'node:path'

import { addErrorInfo } from '../error/info.js'
import { installMissingPlugins, installIntegrationPlugins } from '../install/missing.js'
import { resolvePath, tryResolvePath } from '../utils/resolve.js'

import { addExpectedVersions } from './expected_version.js'
import { addPluginsNodeVersion } from './node_version.js'
import { addPinnedVersions } from './pinned_version.js'

const AUTO_PLUGINS_DIR = '.netlify/plugins/'

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - automatically installed by us, to `.netlify/plugins/`
export const resolvePluginsPath = async function ({
  pluginsOptions,
  siteInfo,
  buildDir,
  packagePath,
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
  integrations,
  context,
  systemLog,
  pluginsEnv,
}) {
  const autoPluginsDir = getAutoPluginsDir(buildDir, packagePath)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolvePluginPath({ pluginOptions, buildDir, packagePath, autoPluginsDir })),
  )
  const pluginsOptionsB = await addPluginsNodeVersion({
    pluginsOptions: pluginsOptionsA,
    nodePath,
    userNodeVersion,
    logs,
  })

  const pluginsOptionsC = await addPinnedVersions({ pluginsOptions: pluginsOptionsB, api, siteInfo, sendStatus })
  const pluginsOptionsD = await addExpectedVersions({
    pluginsOptions: pluginsOptionsC,
    autoPluginsDir,
    packageJson,
    packagePath,
    debug,
    logs,
    buildDir,
    testOpts,
    featureFlags,
    systemLog,
  })
  const pluginsOptionsE = await handleMissingPlugins({
    pluginsOptions: pluginsOptionsD,
    autoPluginsDir,
    mode,
    logs,
  })

  const integrationPluginOptions = await handleIntegrations({
    integrations,
    autoPluginsDir,
    mode,
    logs,
    buildDir,
    context,
    testOpts,
    pluginsEnv,
  })

  return [...pluginsOptionsE, ...integrationPluginOptions]
}

/**
 * Find the path to the directory used to install plugins automatically.
 * It is a subdirectory of `buildDir`, so that the plugin can require the
 * project's dependencies (peer dependencies).
 * @param {string} buildDir
 * @param {string} [packagePath]
 * @returns
 */
const getAutoPluginsDir = function (buildDir, packagePath) {
  return join(buildDir, packagePath || '', AUTO_PLUGINS_DIR)
}

const resolvePluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, loadedFrom },
  buildDir,
  packagePath,
  autoPluginsDir,
}) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  // Local plugins
  const localPackageName = normalizeLocalPackageName(packageName)
  if (localPackageName.startsWith('.')) {
    const { path: localPath, error } = await tryResolvePath(localPackageName, buildDir)
    validateLocalPluginPath(error, localPackageName)
    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Plugin added to `package.json`
  const packageDir = join(buildDir, packagePath || '')
  const { path: manualPath } = await tryResolvePath(packageName, packageDir)
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

// `packageName` starting with `/` are relative to the build directory
const normalizeLocalPackageName = function (packageName) {
  if (packageName.startsWith('/')) {
    return `.${packageName}`
  }

  return packageName
}

// When requiring a local plugin with an invalid file path
const validateLocalPluginPath = function (error, localPackageName) {
  if (error !== undefined) {
    error.message = `Plugin could not be found using local path: ${localPackageName}\n${error.message}`
    addErrorInfo(error, { type: 'resolveConfig' })
    throw error
  }
}

// Install plugins from the official list that have not been previously installed.
// Print a warning if they have not been installed through the UI.
const handleMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, mode, logs }) {
  const missingPlugins = pluginsOptions.filter(isMissingPlugin)

  if (missingPlugins.length === 0) {
    return pluginsOptions
  }

  await installMissingPlugins({ missingPlugins, autoPluginsDir, mode, logs })
  return Promise.all(pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })))
}

const handleIntegrations = async function ({
  integrations,
  autoPluginsDir,
  mode,
  logs,
  buildDir,
  context,
  testOpts,
  pluginsEnv,
}) {
  const integrationsWithBuildPlugins = integrations.filter((integration) => integration.has_build)
  await installIntegrationPlugins({
    integrations: integrationsWithBuildPlugins,
    autoPluginsDir,
    mode,
    logs,
    context,
    testOpts,
    buildDir,
    pluginsEnv,
  })
  return Promise.all(
    integrationsWithBuildPlugins.map(async (integration) => {
      // TODO(ndhoule): When developing locally, the user can accidentally set an extension name in
      // their netlify.toml that points to a build plugin package that has a mismatched name. This
      // will result in a failed install here. The solution is non-obvious: make sure your
      // `netlify.toml#integrations[].name` matches the extension that `netlify.toml#integrations[].dev.path`
      // points at.
      //
      // (We could, for example, detect a mismatch by untarring the local build plugin package in
      // memory and comparing its `package.json#name` to `integration.slug`, and throw a descriptive
      // error if they don't match.)
      const packageName = `${integration.slug}-buildhooks`
      return {
        integration,
        isIntegration: true,
        loadedFrom: integration.buildPlugin.origin === 'local' ? 'local' : undefined,
        packageName,
        pluginPath: await resolvePath(packageName, autoPluginsDir),
      }
    }),
  )
}

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function ({ pluginOptions, pluginOptions: { packageName }, autoPluginsDir }) {
  if (!isMissingPlugin(pluginOptions)) {
    return pluginOptions
  }

  const pluginPath = await resolvePath(packageName, autoPluginsDir)
  return { ...pluginOptions, pluginPath }
}

const isMissingPlugin = function ({ isMissing }) {
  return isMissing
}
