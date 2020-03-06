const { getConfigPath } = require('./path')
const { getBuildDir } = require('./build_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { normalizeConfig } = require('./normalize')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./events')
const { parseConfig } = require('./parse/main')
const { mergeContext } = require('./context')
const { normalizeOpts } = require('./options')
const { deepMerge } = require('./utils/merge')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function(configFile, { cachedConfig, ...opts } = {}) {
  // Performance optimization when @netlify/config caller has already previously
  // called it and cached the result.
  // This is used by the buildbot which:
  //  - first calls @netlify/config since it needs configuration property
  //  - later calls @netlify/build, which runs @netlify/config under the hood
  if (cachedConfig !== undefined) {
    return await getConfig(cachedConfig, 'cachedConfig')
  }

  const { defaultConfig: defaultConfigPath, cwd, context, repositoryRoot, branch } = await normalizeOpts(opts)

  const defaultConfig = await getConfig(defaultConfigPath, 'defaultConfig')

  const configPath = await getConfigPath(configFile, cwd, repositoryRoot)

  try {
    const config = await parseConfig(configPath)
    const configA = deepMerge(defaultConfig, config)
    const configB = addEnvVars(configA)

    validateConfig(configB)

    const configC = mergeContext(configB, context, branch)
    const configD = normalizeConfig(configC)

    const buildDir = getBuildDir(repositoryRoot, configD)
    const configE = handleFiles(configD, buildDir)
    return { configPath, buildDir, config: configE, context, branch }
  } catch (error) {
    const configMessage = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configMessage}:\n${error.message}`
    throw error
  }
}

const getConfig = async function(configPath, name) {
  try {
    return await parseConfig(configPath)
  } catch (error) {
    error.message = `When resolving ${name} ${configPath}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
