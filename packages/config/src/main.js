/* eslint-disable max-lines */
'use strict'

require('./utils/polyfills')

const { getApiClient } = require('./api/client')
const { getSiteInfo } = require('./api/site_info')
const { mergeContext } = require('./context')
const { parseDefaultConfig } = require('./default')
const { getEnv } = require('./env/main')
const { handleFiles } = require('./files')
const { getInlineConfig } = require('./inline_config')
const { cleanupConfig } = require('./log/cleanup')
const { logResult } = require('./log/main')
const { normalizeBeforeConfigMerge, normalizeAfterConfigMerge } = require('./merge_normalize')
const { addDefaultOpts, normalizeOpts } = require('./options/main')
const { UI_ORIGIN, CONFIG_ORIGIN } = require('./origin')
const { parseConfig } = require('./parse')
const { getConfigPath } = require('./path')
const { mergeConfigs } = require('./utils/merge')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function (opts) {
  const { cachedConfig, host, scheme, pathPrefix, testOpts, token, offline, ...optsA } = addDefaultOpts(opts)
  // `api` is not JSON-serializable, so we cannot cache it inside `cachedConfig`
  const api = getApiClient({ token, offline, host, scheme, pathPrefix, testOpts })

  // Performance optimization when @netlify/config caller has already previously
  // called it and cached the result.
  // This is used by the buildbot which:
  //  - first calls @netlify/config since it needs configuration property
  //  - later calls @netlify/build, which runs @netlify/config under the hood
  if (cachedConfig !== undefined) {
    // The CLI does not print the API `token` for security reasons, which means
    // it might be missing from `cachedConfig`. We provide the one passed in
    // `opts` as a fallback.
    return { token, ...cachedConfig, api }
  }

  const {
    config: configOpt,
    defaultConfig,
    inlineConfig,
    cwd,
    context,
    repositoryRoot,
    base,
    branch,
    siteId,
    deployId,
    baseRelDir,
    mode,
    debug,
    logs,
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
  const inlineConfigA = getInlineConfig({ inlineConfig, logs, debug })

  const { configPath, config } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig: defaultConfigA,
    inlineConfig: inlineConfigA,
    baseRelDir: baseRelDirA,
    logs,
  })

  const { config: configA, buildDir } = await handleFiles({ config, repositoryRoot, baseRelDir: baseRelDirA })

  const env = await getEnv({
    mode,
    config: configA,
    siteInfo,
    accounts,
    addons,
    buildDir,
    branch,
    deployId,
    context,
  })

  // @todo Remove in the next major version.
  const configB = addLegacyFunctionsDirectory(configA)

  const result = {
    siteInfo,
    env,
    configPath,
    buildDir,
    repositoryRoot,
    config: configB,
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
  defaultConfig: { build: { base: defaultBase } = {} },
  inlineConfig,
  inlineConfig: { build: { base: initialBase = defaultBase } = {} },
  baseRelDir,
  logs,
}) {
  const {
    configPath,
    config,
    config: {
      build: { base },
    },
  } = await getFullConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    inlineConfig,
    base: initialBase,
    logs,
  })

  // No second pass needed if:
  //  - there is no `build.base`
  //  - `build.base` is the same as the `Base directory` UI setting (already used in the first round)
  //  - `baseRelDir` feature flag is not used. This feature flag was introduced to ensure
  //    backward compatibility.
  if (!baseRelDir || base === undefined || base === initialBase) {
    return { configPath, config }
  }

  const { configPath: configPathA, config: configA } = await getFullConfig({
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    inlineConfig,
    base,
    logs,
  })

  // Since we don't recurse anymore, we keep the original `build.base` that was used
  const configB = { ...configA, build: { ...configA.build, base } }

  return { configPath: configPathA, config: configB }
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
  base,
  logs,
}) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, base })

  try {
    const config = await parseConfig(configPath)
    const configA = mergeAndNormalizeConfig({ config, defaultConfig, inlineConfig, context, branch, logs })
    return { configPath, config: configA }
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
  const configA = normalizeBeforeConfigMerge(config, CONFIG_ORIGIN)
  const defaultConfigA = normalizeBeforeConfigMerge(defaultConfig, UI_ORIGIN)
  const inlineConfigA = normalizeBeforeConfigMerge(inlineConfig, CONFIG_ORIGIN)

  const configB = mergeConfigs([defaultConfigA, configA, inlineConfigA])
  const configC = mergeContext({ config: configB, context, branch, logs })

  const configD = normalizeAfterConfigMerge(configC)
  return configD
}

module.exports = resolveConfig
// TODO: on next major release, export a single object instead of mutating the
// top-level function
module.exports.cleanupConfig = cleanupConfig
/* eslint-enable max-lines */
