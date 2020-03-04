const { getConfigPath } = require('./path')
const { getBaseDir } = require('./base_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { normalizeConfig } = require('./normalize')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./events')
const { parseConfig } = require('./parse/main')
const { normalizeOpts } = require('./options')

const resolveConfig = async function(configFile, options) {
  const { cwd, context, repositoryRoot } = await normalizeOpts(options)

  const configPath = await getConfigPath(configFile, cwd, repositoryRoot)

  try {
    const config = await parseConfig(configPath)

    const configA = addEnvVars(config)

    validateConfig(configA)

    const configB = normalizeConfig(configA)

    const baseDir = getBaseDir(repositoryRoot, configB)
    const configC = handleFiles(configB, baseDir)
    return { configPath, baseDir, config: configC, context }
  } catch (error) {
    const configMessage = configPath === undefined ? '' : ` file ${configPath}`
    error.message = `When resolving config${configMessage}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
