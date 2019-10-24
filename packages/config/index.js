const { promisify } = require('util')

const configorama = require('configorama')
const pathExists = require('path-exists')
const resolvePath = require('resolve')

const getConfigPath = require('./path')
const { validateConfig } = require('./validate')
const { normalizeConfig } = require('./normalize')

const pResolve = promisify(resolvePath)

async function resolveConfig(configFile, { cwd, ...options } = {}) {
  const configPath = await resolveConfigFile(configFile, cwd)

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
        },
      },
      {
        /* Match variables ${context:xyz} */
        match: /^context:/,
        async resolver(varToProcess, { context = 'production' }) {
          const objectPath = varToProcess.replace('context:', '')
          return `\${self:context.${context}.${objectPath}}`
        },
      },
    ],
  })

  validateConfig(config)

  const configA = normalizeConfig(config)
  return configA
}

// Location can be either local or a Node module, allowing configuration sharing
// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolveConfigFile = async function(configFile, cwd) {
  try {
    return await pResolve(configFile, { basedir: cwd })
  } catch (error) {
    error.message = `Configuration file does not exist: ${configFile}\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
/* Formatting utilities */
module.exports.formatUtils = configorama.format
/* Resolve Netlify config path */
module.exports.getConfigPath = getConfigPath
