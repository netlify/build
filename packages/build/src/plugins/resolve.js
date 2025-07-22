import { join, resolve } from 'path'

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

  let integrationPluginOptions = []

  integrationPluginOptions = await handleIntegrations({
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
  const toInstall = integrations.filter((integration) => integration.has_build)
  await installIntegrationPlugins({
    integrations: toInstall,
    autoPluginsDir,
    mode,
    logs,
    context,
    testOpts,
    buildDir,
    pluginsEnv,
  })

  if (toInstall.length === 0) {
    return []
  }

  return Promise.all(
    toInstall.map((integration) =>
      resolveIntegration({
        integration,
        autoPluginsDir,
        buildDir,
        context,
        testOpts,
      }),
    ),
  )
}

const resolveIntegration = async function ({ integration, autoPluginsDir, buildDir, context, testOpts }) {
  if (typeof integration.dev !== 'undefined' && context === 'dev') {
    const { path } = integration.dev
    const integrationDir = testOpts.cwd ? resolve(testOpts.cwd, path) : resolve(buildDir, path)
    const pluginPath = await resolvePath(`${integrationDir}/.ntli/build`, buildDir)

    return { pluginPath, packageName: `${integration.slug}`, isIntegration: true, integration, loadedFrom: 'local' }
  }

  const pluginPath = await resolvePath(`${integration.slug}-buildhooks`, autoPluginsDir)

  return { pluginPath, packageName: `${integration.slug}-buildhooks`, isIntegration: true, integration }
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
