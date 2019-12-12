const configorama = require('configorama')

const { getConfigPath } = require('./path')
const { getBaseDir } = require('./base_dir')
const { addEnvVars } = require('./env')
const { validateConfig } = require('./validate/main')
const { normalizeConfig } = require('./normalize')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./events')

const resolveConfig = async function(configFile, { cwd, ...options } = {}) {
  const configPath = await getConfigPath(configFile, cwd)
  const baseDir = await getBaseDir(configPath)

  const config = await getConfig(configPath, options)

  const configA = addEnvVars(config)

  validateConfig(configA)

  const configB = normalizeConfig(configA)
  const configC = await handleFiles(configB, baseDir)
  return configC
}

const getConfig = function(configPath, options) {
  if (configPath === undefined) {
    return {}
  }

  return configorama(configPath, {
    options,
    variableSources: [
      {
        // ${context:VAR} -> config.context.CONTEXT.VAR
        match: /^context:/,
        async resolver(varToProcess, { context }) {
          const objectPath = varToProcess.replace('context:', '')
          return `\${self:context.${context}.${objectPath}}`
        },
      },
    ],
  })
}

module.exports = resolveConfig
module.exports.getBaseDir = getBaseDir
module.exports.getConfigPath = getConfigPath
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
