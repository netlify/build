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

const resolveConfig = async function(configFile, options) {
  const { cwd, context, repositoryRoot } = await normalizeOpts(options)

  const configPath = await getConfigPath(configFile, cwd, repositoryRoot)

  try {
    const config = await parseConfig(configPath)
    const configA = addEnvVars(config)
    const configB = mergeContext(configA, context)

    validateConfig(configB)

    const configC = normalizeConfig(configB)

    const buildDir = getBuildDir(repositoryRoot, configC)
    const configD = handleFiles(configC, buildDir)
    return { configPath, buildDir, config: configD, context }
  } catch (error) {
    const configMessage = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configMessage}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
