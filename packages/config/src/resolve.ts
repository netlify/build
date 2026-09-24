import { getApiClient, getSiteData } from './api.js'
import { getCachedResult, readCachedConfig } from './cached.js'
import { cleanupConfig, cleanupEnvironment } from './cleanup.js'
import { resolveDirectories } from './directories.js'
import { getEnv } from './env.js'
import { getIntegrations } from './extensions.js'
import { getDefaultLayer } from './layers.js'
import { loadConfig } from './load.js'
import { logObject, logSubHeader } from './log.js'
import { applyMutations } from './mutations.js'
import { resolveOptions } from './options.js'
import type { Config, Logs, NetlifyConfig, RawConfig, ResolveConfigOptions } from './types.js'

export const resolveConfig = async function (rawOptions: ResolveConfigOptions = {}): Promise<Config> {
  const options = resolveOptions(rawOptions)
  const { logs, debug } = options

  // A client can't be serialized, so it's created even for a cached config.
  const api = getApiClient(options)
  const cached = await readCachedConfig(options)
  // A cached config is returned as is, unless a `defaultConfig` is given, as netlify-cli and
  // `@netlify/build` do: then everything is resolved again, reusing parts of the cache.
  if (cached !== undefined && !options.hasDefaultConfig) {
    return getCachedResult(cached, options, api)
  }

  const directories = await resolveDirectories(options)
  const { siteInfo, accounts, extensions } = await getSiteData({ options, api, cached })

  const defaultLayer = getDefaultLayer({ options, directories, siteInfo })
  if (debug) {
    logDebugBlock(
      logs,
      'UI build settings',
      cleanupConfig({ ...defaultLayer.defaultConfig, baseRelDir: defaultLayer.baseRelDir }),
    )
  }
  // Mutations are applied after the UI block is printed, so it is printed even when one is rejected.
  const inlineConfig = applyMutations(options.inlineConfig, options.configMutations)
  if (debug && Object.keys(inlineConfig).length !== 0) {
    logDebugBlock(logs, 'Configuration override', cleanupConfig(inlineConfig))
  }
  const layers = { ...defaultLayer, inlineConfig }

  const { configPath, config, buildDir, headersPath, redirectsPath } = await loadConfig({
    options,
    directories,
    layers,
  })
  const { repositoryRoot, branch } = directories
  const env = await getEnv({ options, api, siteInfo, accounts, config, buildDir, branch, cachedEnv: cached?.env })
  const integrations = await getIntegrations({ options, extensions, config, buildDir })

  const result: Config = {
    siteInfo,
    integrations,
    accounts,
    env,
    configPath,
    redirectsPath,
    headersPath,
    buildDir,
    repositoryRoot,
    config: addLegacyFunctionsDirectory(config),
    context: options.context,
    branch,
    token: options.token,
    api,
    logs,
  }

  if (debug) {
    logDebugBlock(logs, 'Resolved build environment', {
      configPath,
      buildDir,
      context: result.context,
      branch,
      // Values may be secrets, so only names are printed.
      env: cleanupEnvironment(env),
    })
    logDebugBlock(logs, 'Resolved config', cleanupConfig(result.config))
  }

  return result
}

const logDebugBlock = function (logs: Logs | undefined, title: string, value: RawConfig) {
  logSubHeader(logs, title)
  logObject(logs, value)
}

/** `build.functions` mirrors `functionsDirectory`, for backward compatibility. */
const addLegacyFunctionsDirectory = function (config: NetlifyConfig): NetlifyConfig {
  if (!config.functionsDirectory) {
    return config
  }
  return { ...config, build: { ...config.build, functions: config.functionsDirectory } }
}
