const { promisify } = require('util')
const { dirname } = require('path')

const resolve = require('resolve')

const { CORE_PLUGINS } = require('../plugins_core/main')
const { logResolveError } = require('../log/main')
const { addDependency } = require('../utils/install')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins: pluginsOptions }, buildDir, configPath) {
  const pluginsOptionsA = [...CORE_PLUGINS, ...pluginsOptions].map(normalizePluginOptions).filter(isPluginEnabled)
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => resolvePlugin(pluginOptions, buildDir, configPath)),
  )
  return pluginsOptionsB
}

const normalizePluginOptions = function(pluginOptions) {
  const { id, package, core, enabled, inputs } = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...pluginOptions,
  }
  const local = !core && (package.startsWith('.') || package.startsWith('/'))
  return { id, package, local, core, enabled, inputs }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, core: false, inputs: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

// We use `resolve` because `require()` should be relative to `buildDir` not to
// this `__filename`
const resolvePlugin = async function({ package, ...pluginOptions }, buildDir, configPath) {
  try {
    return await tryResolvePlugin({ package, pluginOptions, buildDir, configPath })
    // Try installing the dependency if it is missing.
    // This also solves Yarn Plug-and-Play, which does not work well with
    // `resolve`
  } catch (error) {
    logResolveError(error, package)
    await addDependency(package, { packageRoot: buildDir })
    return await tryResolvePlugin({ package, pluginOptions, buildDir, configPath })
  }
}

const tryResolvePlugin = async function({ package, pluginOptions, buildDir, configPath }) {
  const basedir = configPath === undefined ? buildDir : dirname(configPath)
  const pluginPath = await pResolve(package, { basedir })
  return { ...pluginOptions, package, pluginPath }
}

module.exports = { getPluginsOptions }
