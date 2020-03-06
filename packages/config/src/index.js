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

const resolveConfig = async function(configFile, options) {
  const { defaultConfig: defaultConfigPath, cwd, context, repositoryRoot, branch } = await normalizeOpts(options)

  const defaultConfig = await getDefaultConfig(defaultConfigPath)

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

const getDefaultConfig = async function(defaultConfigPath) {
  try {
    return await parseConfig(defaultConfigPath)
  } catch (error) {
    error.message = `When resolving defaultConfig ${defaultConfigPath}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
