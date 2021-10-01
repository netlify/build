/* eslint-disable max-lines */
'use strict'

require('./utils/polyfills')

const { getApiClient } = require('./api/client')
const { getSiteInfo } = require('./api/site_info')
const { getInitialBase, getBase, addBase } = require('./base')
const { getBuildDir } = require('./build_dir')
const { getCachedConfig } = require('./cached_config')
const { normalizeContextProps, mergeContext } = require('./context')
const { parseDefaultConfig } = require('./default')
const { getEnv } = require('./env/main')
const { EVENTS } = require('./events')
const { resolveConfigPaths } = require('./files')
const { getHeadersPath, addHeaders } = require('./headers')
const { getInlineConfig } = require('./inline_config')
const { cleanupConfig } = require('./log/cleanup')
const { logResult } = require('./log/main')
const { mergeConfigs } = require('./merge')
const { normalizeBeforeConfigMerge, normalizeAfterConfigMerge } = require('./merge_normalize')
const { updateConfig, restoreConfig } = require('./mutations/update')
const { addDefaultOpts, normalizeOpts } = require('./options/main')
const { UI_ORIGIN, CONFIG_ORIGIN, INLINE_ORIGIN } = require('./origin')
const { parseConfig } = require('./parse')
const { getConfigPath } = require('./path')
// eslint-disable-next-line import/max-dependencies
const { getRedirectsPath, addRedirects } = require('./redirects')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function (opts) {
  const { cachedConfig, cachedConfigPath, host, scheme, pathPrefix, testOpts, token, offline, ...optsA } =
    addDefaultOpts(opts)
  // `api` is not JSON-serializable, so we cannot cache it inside `cachedConfig`
  const api = getApiClient({ token, offline, host, scheme, pathPrefix, testOpts })

  const parsedCachedConfig = await getCachedConfig({ cachedConfig, cachedConfigPath, token, api })
  if (parsedCachedConfig !== undefined) {
    return parsedCachedConfig
  }

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
    deployId,
    buildId,
    baseRelDir,
    mode,
    debug,
    logs,
    featureFlags,
  } = await normalizeOpts(optsA)

  const { siteInfo, accounts, addons } = await getSiteInfo({ api, siteId, mode, testOpts })

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
    branch,
    defaultConfig: defaultConfigA,
    inlineConfig: inlineConfigA,
    baseRelDir: baseRelDirA,
    logs,
    featureFlags,
  })

  const env = await getEnv({
    mode,
    config,
    siteInfo,
    accounts,
    addons,
    buildDir,
    branch,
    deployId,
    buildId,
    context,
  })

  // @todo Remove in the next major version.
  const configA = addLegacyFunctionsDirectory(config)

  const result = {
    siteInfo,
    accounts,
    addons,
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

// Adds a `build.functions` property that mirrors `functionsDirectory`, for
// backward compatibility.
const addLegacyFunctionsDirectory = (config) => {
  if (!config.functionsDirectory) {
    return config
  }

  return {
    ...config,
    build: {
      ...config.build,
      functions: config.functionsDirectory,
    },
  }
}

// Try to load the configuration file in two passes.
// The first pass uses the `defaultConfig`'s `build.base` (if defined).
// The second pass uses the `build.base` from the first pass (if defined).
const loadConfig = async function ({
  configOpt,
  cwd,
  context,
  repositoryRoot,
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
    configBase: initialBase,
    logs,
    featureFlags,
  })

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
  })
  return {
    configPath: configPathA,
    config: configA,
    buildDir: buildDirA,
    redirectsPath: redirectsPathA,
    headersPath: headersPathA,
  }
}

// Load configuration file and normalize it, merge contexts, etc.
const getFullConfig = async function ({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  branch,
  defaultConfig,
  inlineConfig,
  baseRelDir,
  configBase,
  base,
  logs,
  featureFlags,
}) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, configBase })

  try {
    const config = await parseConfig(configPath, logs, featureFlags)
    const configA = mergeAndNormalizeConfig({
      config,
      defaultConfig,
      inlineConfig,
      context,
      branch,
      logs,
    })
    const {
      config: configB,
      buildDir,
      base: baseA,
    } = await resolveFiles({ config: configA, repositoryRoot, base, baseRelDir })
    const headersPath = getHeadersPath(configB)
    const configC = await addHeaders(configB, headersPath, logs)
    const redirectsPath = getRedirectsPath(configC)
    const configD = await addRedirects(configC, redirectsPath, logs)
    return { configPath, config: configD, buildDir, base: baseA, redirectsPath, headersPath }
  } catch (error) {
    const configName = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configName}:\n${error.message}`
    throw error
  }
}

// Merge:
//  - `--defaultConfig`: UI build settings and UI-installed plugins
//  - `inlineConfig`: Netlify CLI flags
// Then merge context-specific configuration.
// Before and after those steps, also performs validation and normalization.
// Those need to be done at different stages depending on whether they should
// happen before/after the merges mentioned above.
const mergeAndNormalizeConfig = function ({ config, defaultConfig, inlineConfig, context, branch, logs }) {
  const configA = normalizeConfigAndContext(config, CONFIG_ORIGIN)
  const defaultConfigA = normalizeConfigAndContext(defaultConfig, UI_ORIGIN)
  const inlineConfigA = normalizeConfigAndContext(inlineConfig, INLINE_ORIGIN)

  const configB = mergeConfigs([defaultConfigA, configA])
  const configC = mergeContext({ config: configB, context, branch, logs })
  const configD = mergeConfigs([configC, inlineConfigA])

  const configE = normalizeAfterConfigMerge(configD)
  return configE
}

const normalizeConfigAndContext = function (config, origin) {
  const configA = normalizeBeforeConfigMerge(config, origin)
  const configB = normalizeContextProps({ config: configA, origin })
  return configB
}

// Find base directory, build directory and resolve all paths to absolute paths
const resolveFiles = async function ({ config, repositoryRoot, base, baseRelDir }) {
  const baseA = getBase(base, repositoryRoot, config)
  const buildDir = await getBuildDir(repositoryRoot, baseA)
  const configA = await resolveConfigPaths({ config, repositoryRoot, buildDir, baseRelDir })
  const configB = addBase(configA, baseA)
  return { config: configB, buildDir, base: baseA }
}

module.exports = resolveConfig
// TODO: on next major release, export a single object instead of mutating the
// top-level function
module.exports.cleanupConfig = cleanupConfig
module.exports.updateConfig = updateConfig
module.exports.restoreConfig = restoreConfig
module.exports.EVENTS = EVENTS
/* eslint-enable max-lines */
