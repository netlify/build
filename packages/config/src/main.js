require('./utils/polyfills')

const { getApiClient } = require('./api/client')
const { getSiteInfo } = require('./api/site_info')
const { normalizeConfigCase } = require('./case')
const { mergeContext } = require('./context')
const { getConfig, parseDefaultConfig } = require('./default')
const { handleFiles } = require('./files')
const { getInlineConfig } = require('./inline_config')
const { cleanupConfig } = require('./log/cleanup')
const { logResult } = require('./log/main')
const { mergeConfigs } = require('./merge')
const { normalizeConfig } = require('./normalize')
const { addDefaultOpts, normalizeOpts } = require('./options/main')
const { parseConfig } = require('./parse')
const { getConfigPath } = require('./path')
const {
  validatePreCaseNormalize,
  validatePreMergeConfig,
  validatePreContextConfig,
  validatePreNormalizeConfig,
  validatePostNormalizeConfig,
} = require('./validate/main')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function(opts) {
  const { cachedConfig, ...optsA } = addDefaultOpts(opts)
  // `api` is not JSON-serializable, so we cannot cache it inside `cachedConfig`
  const api = getApiClient(optsA)

  // Performance optimization when @netlify/config caller has already previously
  // called it and cached the result.
  // This is used by the buildbot which:
  //  - first calls @netlify/config since it needs configuration property
  //  - later calls @netlify/build, which runs @netlify/config under the hood
  if (cachedConfig !== undefined) {
    return { ...getConfig(cachedConfig, 'cached'), api }
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
    baseRelDir,
    mode,
    debug,
    logs,
  } = await normalizeOpts(optsA)

  const siteInfo = await getSiteInfo(api, siteId, mode)

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
  })

  const { config: configA, buildDir } = await handleFiles({ config, repositoryRoot, baseRelDir: baseRelDirA })

  const result = { siteInfo, configPath, buildDir, config: configA, context, branch, api, logs }
  logResult(result, { logs, debug })
  return result
}

// Try to load the configuration file in two passes.
// The first pass uses the `defaultConfig`'s `build.base` (if defined).
// The second pass uses the `build.base` from the first pass (if defined).
const loadConfig = async function({
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
  })

  // Since we don't recurse anymore, we keep the original `build.base` that was used
  const configB = { ...configA, build: { ...configA.build, base } }

  return { configPath: configPathA, config: configB }
}

// Load configuration file and normalize it, merge contexts, etc.
const getFullConfig = async function({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  branch,
  defaultConfig,
  inlineConfig,
  base,
}) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, base })

  try {
    const config = await parseConfig(configPath)

    validatePreCaseNormalize(config)
    const configA = normalizeConfigCase(config)

    validatePreMergeConfig(defaultConfig, configA, inlineConfig)
    const configB = mergeConfigs(defaultConfig, configA, inlineConfig)

    validatePreContextConfig(configB)
    const configC = mergeContext(configB, context, branch)

    validatePreNormalizeConfig(configC)
    const configD = normalizeConfig(configC)

    validatePostNormalizeConfig(configD)

    return { configPath, config: configD }
  } catch (error) {
    const configName = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configName}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
// TODO: on next major release, export a single object instead of mutating the
// top-level function
module.exports.cleanupConfig = cleanupConfig
