const { resolve } = require('path')
const { cwd } = require('process')

const configorama = require('configorama')
const pathExists = require('path-exists')

const getConfigPath = require('./path')
const { validateConfig } = require('./validate')
const { normalizeConfig } = require('./normalize')

async function resolveConfig(configFile, options) {
  const configPath = resolve(cwd(), configFile)

  if (!(await pathExists(configPath))) {
    throw new Error(`Configuration file does not exist: ${configPath}`)
  }

  const config = await configorama(configPath, {
    options,
    variableSources: [
      {
        /* Match variables ${secrets:xyz} */
        match: /^secrets:/,
        async resolver() {
          // Call to remote secret store
          return 'shhhhhhh'
        }
      },
      {
        /* Match variables ${context:xyz} */
        match: /^context:/,
        async resolver(varToProcess, { context = 'production' }) {
          const objectPath = varToProcess.replace('context:', '')
          return `\${self:context.${context}.${objectPath}}`
        }
      }
    ]
  })

  validateConfig(config)

  const configA = normalizeConfig(config)
  return configA
}

module.exports = resolveConfig
/* Formatting utilities */
module.exports.formatUtils = configorama.format
/* Resolve Netlify config path */
module.exports.getConfigPath = getConfigPath
