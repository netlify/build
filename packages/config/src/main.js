require('./utils/polyfills')

const { addBuildSettings } = require('./api/build_settings')
const { getApiClient } = require('./api/client')
const { getSiteInfo } = require('./api/site_info')
const { normalizeConfigCase } = require('./case')
const { mergeContext } = require('./context')
const { mergeDefaultConfig } = require('./default_config')
const { throwError } = require('./error')
const { handleFiles } = require('./files')
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
    cwd,
    context,
    repositoryRoot,
    branch,
    siteId,
    baseRelDir,
    mode,
  } = await normalizeOpts(optsA)

  // Retrieve default configuration file. It has less priority and it also does
  // not get normalized, merged with contexts, etc.
  const defaultConfigA = getConfig(defaultConfig, 'default')

  const siteInfo = await getSiteInfo(api, siteId, mode)
  const { defaultConfig: defaultConfigB, baseRelDir: baseRelDirA = DEFAULT_BASE_REL_DIR } = addBuildSettings({
    defaultConfig: defaultConfigA,
    baseRelDir,
    siteInfo,
  })

  const { configPath, config } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig: defaultConfigB,
    baseRelDir: baseRelDirA,
  })

  const { config: configA, buildDir } = await handleFiles({ config, repositoryRoot, baseRelDir: baseRelDirA })

  return { siteInfo, configPath, buildDir, config: configA, context, branch, api }
}

// `baseRelDir` should default to `true` only if the option was not passed and
// it could be retrieved from the `siteInfo`, which is why the default value
// is assigned later than other properties.
const DEFAULT_BASE_REL_DIR = true

// Load a configuration file passed as a JSON object.
// The logic is much simpler: it does not normalize nor validate it.
const getConfig = function(config, name) {
  if (config === undefined) {
    return {}
  }

  try {
    return JSON.parse(config)
  } catch (error) {
    throwError(`When resolving ${name} configuration`, error)
  }
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
  baseRelDir,
}) {
  const {
    configPath,
    config,
    config: {
      build: { base },
    },
  } = await getFullConfig({ configOpt, cwd, context, repositoryRoot, branch, defaultConfig, base: defaultBase })

  // No second pass needed if:
  //  - there is no `build.base`
  //  - `build.base` is the same as the `Base directory` UI setting (already used in the first round)
  //  - `baseRelDir` feature flag is not used. This feature flag was introduced to ensure
  //    backward compatibility.
  if (!baseRelDir || base === undefined || base === defaultBase) {
    return { configPath, config }
  }

  const { configPath: configPathA, config: configA } = await getFullConfig({
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    base,
  })

  // Since we don't recurse anymore, we keep the original `build.base` that was used
  const configB = { ...configA, build: { ...configA.build, base } }

  return { configPath: configPathA, config: configB }
}

// Load configuration file and normalize it, merge contexts, etc.
const getFullConfig = async function({ configOpt, cwd, context, repositoryRoot, branch, defaultConfig, base }) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, base })

  try {
    const config = await parseConfig(configPath)

    validatePreCaseNormalize(config)
    const configA = normalizeConfigCase(config)

    validatePreMergeConfig(configA, defaultConfig)
    const configB = mergeDefaultConfig(defaultConfig, configA)

    validatePreContextConfig(configB)
    const configC = mergeContext(configB, context, branch)

    validatePreNormalizeConfig(configC)
    const configD = normalizeConfig(configC)

    validatePostNormalizeConfig(configD)

    return { configPath, config: configD }
  } catch (error) {
    error.message = `When resolving config file ${configPath}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
