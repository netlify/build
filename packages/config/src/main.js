require('./utils/polyfills')

const { getConfigPath } = require('./path')
const { getBuildDir } = require('./build_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { handleFiles } = require('./files')
const { normalizeConfig } = require('./normalize/main')
const { EVENTS, LEGACY_EVENTS } = require('./normalize/events')
const { parseConfig } = require('./parse/main')
const { mergeContext } = require('./context')
const { normalizeOpts } = require('./options/main')
const { deepMerge } = require('./utils/merge')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function({ cachedConfig, ...opts } = {}) {
  // Performance optimization when @netlify/config caller has already previously
  // called it and cached the result.
  // This is used by the buildbot which:
  //  - first calls @netlify/config since it needs configuration property
  //  - later calls @netlify/build, which runs @netlify/config under the hood
  if (cachedConfig !== undefined) {
    return await getConfig(cachedConfig, 'cachedConfig')
  }

  const {
    config: configOpt,
    defaultConfig: defaultConfigPath,
    cwd,
    context,
    repositoryRoot,
    branch,
  } = await normalizeOpts(opts)

  const defaultConfig = await getConfig(defaultConfigPath, 'defaultConfig')

  const { configPath, config } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
  })

  const buildDir = getBuildDir(repositoryRoot, config)
  const configA = handleFiles(config, buildDir)

  return { configPath, buildDir, config: configA, context, branch }
}

// Load configuration file without normalizing it nor merging contexts, etc.
const getConfig = async function(configPath, name) {
  try {
    return await parseConfig(configPath)
  } catch (error) {
    error.message = `When resolving ${name} ${configPath}:\n${error.message}`
    throw error
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
}) {
  const {
    configPath,
    config,
    config: {
      build: { base },
    },
  } = await getFullConfig({ configOpt, cwd, context, repositoryRoot, branch, defaultConfig, base: defaultBase })

  // No second pass needed since there is no `build.base`
  if (base === undefined || base === defaultBase) {
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
    const configA = deepMerge(defaultConfig, config)
    const configB = addEnvVars(configA)

    validateConfig(configB)

    const configC = mergeContext(configB, context, branch)
    const configD = normalizeConfig(configC)
    return { configPath, config: configD }
  } catch (error) {
    const configMessage = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configMessage}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
