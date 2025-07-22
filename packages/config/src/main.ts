import { getApiClient } from './api/client.js'
import { getSiteInfo, type MinimalAccount } from './api/site_info.js'
import { getInitialBase, getBase, addBase } from './base.js'
import { getBuildDir } from './build_dir.js'
import { getCachedConfig } from './cached_config.js'
import { normalizeContextProps, mergeContext } from './context.js'
import { parseDefaultConfig } from './default.js'
import { getEnv } from './env/main.js'
import { resolveConfigPaths } from './files.js'
import { getHeadersPath, addHeaders } from './headers.js'
import { getInlineConfig } from './inline_config.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  mergeExtensions,
  NETLIFY_API_STAGING_BASE_URL,
} from './extensions.js'
import { logResult } from './log/main.js'
import { mergeConfigs } from './merge.js'
import { normalizeBeforeConfigMerge, normalizeAfterConfigMerge } from './merge_normalize.js'
import { addDefaultOpts, normalizeOpts } from './options/main.js'
import { UI_ORIGIN, CONFIG_ORIGIN, INLINE_ORIGIN } from './origin.js'
import { parseConfig } from './parse.js'
import { getConfigPath } from './path.js'
import { getRedirectsPath, addRedirects } from './redirects.js'
import { handleAutoInstallExtensions } from './utils/extensions/auto-install-extensions.js'

export type Config = {
  accounts: MinimalAccount[] | undefined
  api: any
  branch: any
  buildDir: any
  config: any
  configPath: any
  context: any
  env: any
  headersPath: any
  integrations: {
    slug: string
    author?: string | undefined
    has_build?: boolean | undefined
    version?: string | undefined
    dev?:
      | {
          path: string
        }
      | undefined
  }[]
  logs: any
  redirectsPath: any
  repositoryRoot: any
  siteInfo: any
  token: any
}

/**
 * Load the configuration file.
 * Takes an optional configuration file path as input and return the resolved
 * `config` together with related properties such as the `configPath`.
 */
export const resolveConfig = async function (opts): Promise<Config> {
  const {
    cachedConfig,
    cachedConfigPath,
    host,
    scheme,
    packagePath,
    pathPrefix,
    testOpts,
    token,
    offline,
    siteFeatureFlagPrefix,
    ...optsA
  } = addDefaultOpts(opts) as $TSFixMe
  // `api` is not JSON-serializable, so we cannot cache it inside `cachedConfig`
  const api = getApiClient({ token, offline, host, scheme, pathPrefix, testOpts })

  const parsedCachedConfig = await getCachedConfig({ cachedConfig, cachedConfigPath, token, api })
  // If there is a cached config, use it. The exception is when a default config,
  // which consumers like the CLI can set, is present. In those cases, let the
  // flow continue so that the default config is parsed and used.
  if (parsedCachedConfig !== undefined && opts.defaultConfig === undefined) {
    return parsedCachedConfig
  }

  // TODO(kh): remove this mapping and get the extensionApiHost from the opts
  const extensionApiBaseUrl = host?.includes(NETLIFY_API_STAGING_BASE_URL)
    ? EXTENSION_API_STAGING_BASE_URL
    : EXTENSION_API_BASE_URL

  const {
    config: configOpt,
    defaultConfig,
    inlineConfig,
    configMutations,
    cwd,
    context,
    repositoryRoot,
    base,
    branch,
    siteId,
    accountId,
    deployId,
    buildId,
    baseRelDir,
    mode,
    debug,
    logs,
    featureFlags,
  } = await normalizeOpts(optsA)

  let { siteInfo, accounts, integrations: extensions } = parsedCachedConfig || {}

  // If we have cached site info, we don't need to fetch it again
  const useCachedSiteInfo = Boolean(featureFlags?.use_cached_site_info && siteInfo && accounts && extensions)

  // I'm adding some debug logging to see if the logic is working as expected
  if (featureFlags?.use_cached_site_info_logging) {
    console.log('Checking site information', { useCachedSiteInfo, siteInfo, accounts, extensions })
  }

  if (!useCachedSiteInfo) {
    const updatedSiteInfo = await getSiteInfo({
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
    })

    siteInfo = updatedSiteInfo.siteInfo
    accounts = updatedSiteInfo.accounts
    extensions = updatedSiteInfo.extensions
  }

  const { defaultConfig: defaultConfigA, baseRelDir: baseRelDirA } = parseDefaultConfig({
    defaultConfig,
    base,
    baseRelDir,
    siteInfo,
    logs,
    debug,
  })
  const inlineConfigA = getInlineConfig({ inlineConfig, configMutations, logs, debug })

  const { configPath, config, buildDir, redirectsPath, headersPath } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    packagePath,
    branch,
    defaultConfig: defaultConfigA,
    inlineConfig: inlineConfigA,
    baseRelDir: baseRelDirA,
    logs,
    featureFlags,
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
    buildId,
    context,
    cachedEnv: parsedCachedConfig?.env || {},
  })

  // @todo Remove in the next major version.
  const configA = addLegacyFunctionsDirectory(config)

  const updatedExtensions = await handleAutoInstallExtensions({
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

  const mergedExtensions = mergeExtensions({
    apiExtensions: updatedExtensions,
    configExtensions: configA.integrations,
    context: context,
  })

  const result = {
    siteInfo,
    integrations: mergedExtensions,
    accounts,
    env,
    configPath,
    redirectsPath,
    headersPath,
    buildDir,
    repositoryRoot,
    config: configA,
    context,
    branch,
    token,
    api,
    logs,
  }

  logResult(result, { logs, debug })
  return result
}

/**
 * Adds a `build.functions` property that mirrors `functionsDirectory`, for
 * backward compatibility.
 */
const addLegacyFunctionsDirectory = (config) => {
  if (!config.functionsDirectory) {
    return config
  }

  return { ...config, build: { ...config.build, functions: config.functionsDirectory } }
}

/**
 * Try to load the configuration file in two passes.
 * The first pass uses the `defaultConfig`'s `build.base` (if defined).
 * The second pass uses the `build.base` from the first pass (if defined).
 */
const loadConfig = async function ({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  packagePath,
  branch,
  defaultConfig,
  inlineConfig,
  baseRelDir,
  logs,
  featureFlags,
}) {
  const initialBase = getInitialBase({ repositoryRoot, defaultConfig, inlineConfig })
  const { configPath, config, buildDir, base, redirectsPath, headersPath } = await getFullConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    inlineConfig,
    baseRelDir,
    packagePath,
    configBase: initialBase,
    logs,
    featureFlags,
  } as $TSFixMe)

  // No second pass needed if:
  //  - there is no `build.base` (in which case both `base` and `initialBase`
  //    are `undefined`)
  //  - `build.base` is the same as the `Base directory` UI setting (already
  //    used in the first round)
  //  - `baseRelDir` feature flag is not used. This feature flag was introduced
  //    to ensure backward compatibility.
  if (!baseRelDir || base === initialBase) {
    return { configPath, config, buildDir, redirectsPath, headersPath }
  }

  const {
    configPath: configPathA,
    config: configA,
    buildDir: buildDirA,
    redirectsPath: redirectsPathA,
    headersPath: headersPathA,
  } = await getFullConfig({
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    inlineConfig,
    baseRelDir,
    configBase: base,
    base,
    logs,
    featureFlags,
  } as $TSFixMe)
  return {
    configPath: configPathA,
    config: configA,
    buildDir: buildDirA,
    redirectsPath: redirectsPathA,
    headersPath: headersPathA,
  }
}

/**
 * Load configuration file and normalize it, merge contexts, etc.
 */
const getFullConfig = async function ({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  packagePath,
  branch,
  defaultConfig,
  inlineConfig,
  baseRelDir,
  configBase,
  base,
  logs,
  featureFlags,
}) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, packagePath, configBase })
  try {
    const config = await parseConfig(configPath)
    const configA = mergeAndNormalizeConfig({ config, defaultConfig, inlineConfig, context, branch, logs, packagePath })
    const {
      config: configB,
      buildDir,
      base: baseA,
    } = await resolveFiles({ packagePath, config: configA, repositoryRoot, base, baseRelDir })
    const headersPath = getHeadersPath(configB)
    const configC = await addHeaders({ config: configB, headersPath, logs })
    const redirectsPath = getRedirectsPath(configC)
    const configD = await addRedirects({ config: configC, redirectsPath, logs, featureFlags })
    return { configPath, config: configD, buildDir, base: baseA, redirectsPath, headersPath }
  } catch (error) {
    const configName = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configName}:\n${error.message}`
    throw error
  }
}

/**
 * Merge:
 *  - `--defaultConfig`: UI build settings and UI-installed plugins
 *  - `inlineConfig`: Netlify CLI flags
 * Then merge context-specific configuration.
 * Before and after those steps, also performs validation and normalization.
 * Those need to be done at different stages depending on whether they should
 * happen before/after the merges mentioned above.
 */
const mergeAndNormalizeConfig = function ({ config, defaultConfig, inlineConfig, context, branch, logs, packagePath }) {
  const configA = normalizeConfigAndContext(config, CONFIG_ORIGIN)
  const defaultConfigA = normalizeConfigAndContext(defaultConfig, UI_ORIGIN)
  const inlineConfigA = normalizeConfigAndContext(inlineConfig, INLINE_ORIGIN)

  const configB = mergeConfigs([defaultConfigA, configA])
  const configC = mergeContext({ config: configB, context, branch, logs })
  const configD = mergeConfigs([configC, inlineConfigA])

  return normalizeAfterConfigMerge(configD, packagePath)
}

const normalizeConfigAndContext = function (config, origin) {
  const configA = normalizeBeforeConfigMerge(config, origin)
  const configB = normalizeContextProps({ config: configA, origin })
  return configB
}

/**
 * Find base directory, build directory and resolve all paths to absolute paths
 */
const resolveFiles = async function ({
  config,
  repositoryRoot,
  base,
  packagePath,
  baseRelDir,
}: {
  config: $TSFixMe
  repositoryRoot: string
  packagePath?: string
  base?: string
  baseRelDir?: boolean
}) {
  const baseA = getBase(base, repositoryRoot, config)
  const buildDir = await getBuildDir(repositoryRoot, baseA)
  const configA = resolveConfigPaths({ config, packagePath, repositoryRoot, buildDir, baseRelDir })
  const configB = addBase(configA, baseA)
  return { config: configB, buildDir, base: baseA }
}
