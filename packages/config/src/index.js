const {
  cwd: getCwd,
  env: { CONTEXT },
} = require('process')

const { getConfigPath } = require('./path')
const { getBaseDir } = require('./base_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { normalizeConfig } = require('./normalize')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./events')
const { parseConfig } = require('./parse/main')

const resolveConfig = async function(configFile, { cwd = getCwd(), context = CONTEXT || 'production' } = {}) {
  const configPath = await getConfigPath(configFile, cwd)

  try {
    const baseDir = await getBaseDir(configPath)

    const config = await parseConfig(configPath)

    const configA = addEnvVars(config)

    validateConfig(configA)

    const configB = normalizeConfig(configA)
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
