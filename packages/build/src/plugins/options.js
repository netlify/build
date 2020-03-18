const { promisify } = require('util')
const { dirname } = require('path')

const resolve = require('resolve')

const { CORE_PLUGINS } = require('../plugins_core/main')
const { logResolveError } = require('../log/main')
const { addDependency } = require('../utils/install')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins: pluginsOptions }, buildDir, configPath) {
  const pluginsOptionsA = [...CORE_PLUGINS, ...pluginsOptions].map(normalizePluginOptions)
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => resolvePlugin(pluginOptions, buildDir, configPath)),
  )
  return pluginsOptionsB
}

const normalizePluginOptions = function(pluginOptions) {
  const { package, core, inputs } = { ...DEFAULT_PLUGIN_OPTIONS, ...pluginOptions }
  const local = core === undefined && (package.startsWith('.') || package.startsWith('/'))
  return { package, local, core, inputs }
}

const DEFAULT_PLUGIN_OPTIONS = { inputs: {} }

// We use `resolve` because `require()` should be relative to `buildDir` not to
// this `__filename`
const resolvePlugin = async function({ package, core, ...pluginOptions }, buildDir, configPath) {
  const location = core === undefined ? package : core
  try {
    return await tryResolvePlugin({ location, package, core, pluginOptions, buildDir, configPath })
    // Try installing the dependency if it is missing.
    // This also solves Yarn Plug-and-Play, which does not work well with
    // `resolve`
  } catch (error) {
    logResolveError(error, package)
    await addDependency(location, { packageRoot: buildDir })
    return await tryResolvePlugin({ location, package, core, pluginOptions, buildDir, configPath })
  }
}

const tryResolvePlugin = async function({ location, package, core, pluginOptions, buildDir, configPath }) {
  const basedir = configPath === undefined ? buildDir : dirname(configPath)
  const pluginPath = await pResolve(location, { basedir })
  return { ...pluginOptions, package, core, pluginPath }
}

module.exports = { getPluginsOptions }
