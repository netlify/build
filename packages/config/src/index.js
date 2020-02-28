const { cwd: getCwd } = require('process')

const { getConfigPath } = require('./path')
const { getBaseDir } = require('./base_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { normalizeConfig } = require('./normalize')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./events')
const { parseConfig } = require('./parse/main')

const resolveConfig = async function(configFile, { cwd = getCwd(), ...options } = {}) {
  const configPath = await getConfigPath(configFile, cwd)
  const baseDir = await getBaseDir(configPath)

  const config = await parseConfig(configPath)

  const configA = addEnvVars(config)

  validateConfig(configA)

  const configB = normalizeConfig(configA)
  const configC = await handleFiles(configB, baseDir)
  return configC
}

module.exports = resolveConfig
module.exports.getBaseDir = getBaseDir
module.exports.getConfigPath = getConfigPath
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
