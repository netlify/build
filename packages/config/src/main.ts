import { getApiClient } from './api/client.js'
import { getSiteInfo, type SiteData } from './api/site_info.js'
import { getCachedConfig } from './cached_config.js'
import { parseDefaultConfig } from './default.js'
import { getEnv } from './env/main.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_STAGING_HOSTNAME,
  normalizeAndMergeExtensions,
} from './extensions.js'
import { getInlineConfig } from './inline_config.js'
import { loadConfig } from './load.js'
import { logResult } from './log/main.js'
import { addDefaultOpts, normalizeOpts } from './options/main.js'
import type { ResolvedNetlifyConfig } from './types/config.js'
import type { ResolveConfigOptions } from './types/options.js'
import type { Config } from './types/result.js'
import { handleAutoInstallExtensions } from './utils/extensions/auto-install-extensions.js'

/**
 * Load the configuration file, merge it with the other configuration sources, and resolve it,
 * together with related information such as its path, the build directory and the environment
 * variables.
 */
export const resolveConfig = async function (options: ResolveConfigOptions = {}): Promise<Config> {
  const defaultedOptions = addDefaultOpts(options)
  const { cachedConfig, cachedConfigPath, host, scheme, pathPrefix, testOpts = {}, token, offline } = defaultedOptions

  // `api` can't be serialized, so it isn't in a cached config.
  const api = getApiClient({ token, offline, host, scheme, pathPrefix, testOpts })
  const parsedCachedConfig = await getCachedConfig({ cachedConfig, cachedConfigPath, token, api })
  // A cached config is returned as is, unless a `defaultConfig` is given, as netlify-cli does:
  // then the configuration is resolved again, reusing the cached site information.
  if (parsedCachedConfig !== undefined && options.defaultConfig === undefined) {
    return parsedCachedConfig
  }

  const {
    config: configOpt,
    defaultConfig,
    inlineConfig,
    configMutations,
    configMutationsOrigin,
    cwd,
    context,
    repositoryRoot,
    packagePath,
    base,
    branch,
    siteId,
    accountId,
    deployId,
    skewProtectionToken,
    buildId,
    baseRelDir,
    mode,
    debug,
    logs,
    featureFlags,
    siteFeatureFlagPrefix,
  } = await normalizeOpts(defaultedOptions)

  // TODO(kh): remove this mapping and get the extensionApiHost from the opts
  const extensionApiBaseUrl = host?.includes(NETLIFY_API_STAGING_HOSTNAME)
    ? EXTENSION_API_STAGING_BASE_URL
    : EXTENSION_API_BASE_URL

  const { siteInfo, accounts, extensions } = await getSiteData({
    cached: parsedCachedConfig,
    featureFlags,
    fetch: () =>
      getSiteInfo({
        api,
        context,
        siteId,
        accountId,
        mode,
        siteFeatureFlagPrefix,
        offline,
        featureFlags,
        testOpts,
        token,
        extensionApiBaseUrl,
      }),
  })

  const { defaultConfig: defaultConfigWithSettings, baseRelDir: resolvedBaseRelDir } = parseDefaultConfig({
    defaultConfig,
    base,
    baseRelDir,
    siteInfo,
    logs,
    debug,
  })
  const mutatedInlineConfig = getInlineConfig({ inlineConfig, configMutations, logs, debug })

  const { configPath, config, buildDir, redirectsPath, headersPath } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    packagePath,
    branch,
    defaultConfig: defaultConfigWithSettings,
    inlineConfig: mutatedInlineConfig,
    configMutationsOrigin,
    baseRelDir: resolvedBaseRelDir,
    logs,
  })

  const env = await getEnv({
    api,
    mode,
    config,
    siteInfo,
    accounts,
    buildDir,
    branch,
    deployId,
    skewProtectionToken,
    buildId,
    context,
    cachedEnv: parsedCachedConfig?.env ?? {},
  })

  const installedExtensions = await handleAutoInstallExtensions({
    featureFlags,
    extensions,
    siteId,
    accountId,
    token,
    buildDir,
    extensionApiBaseUrl,
    testOpts,
    offline,
    mode,
    debug,
  })

  // @todo Remove in the next major version.
  const configWithLegacyFunctions = addLegacyFunctionsDirectory(config)

  const integrations = normalizeAndMergeExtensions({
    apiExtensions: installedExtensions,
    configExtensions: configWithLegacyFunctions.integrations,
    buildDir,
    context,
  })

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
    config: configWithLegacyFunctions,
    context,
    branch,
    token,
    api,
    logs,
  }

  logResult(result, { logs, debug })
  return result
}

type SiteDataOptions = {
  cached: Config | undefined
  featureFlags: Record<string, unknown>
  fetch: () => Promise<SiteData>
}

/** The site information from the cached config, behind a feature flag and if it's complete, otherwise from the API. */
const getSiteData = async function ({ cached, featureFlags, fetch }: SiteDataOptions): Promise<SiteData> {
  const { siteInfo, accounts, integrations: extensions } = cached ?? {}
  const useCachedSiteInfo = Boolean(featureFlags.use_cached_site_info && siteInfo && accounts && extensions)

  // I'm adding some debug logging to see if the logic is working as expected
  if (featureFlags.use_cached_site_info_logging) {
    console.log('Checking site information', { useCachedSiteInfo, siteInfo, accounts, extensions })
  }

  if (useCachedSiteInfo && siteInfo && accounts && extensions) {
    return { siteInfo, accounts, extensions }
  }

  return await fetch()
}

/** Also set `build.functions` to `functionsDirectory`, for backward compatibility. */
const addLegacyFunctionsDirectory = function (config: ResolvedNetlifyConfig): ResolvedNetlifyConfig {
  if (!config.functionsDirectory) {
    return config
  }

  return { ...config, build: { ...config.build, functions: config.functionsDirectory } }
}
