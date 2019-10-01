const { resolve } = require('path')
const { cwd } = require('process')

const configorama = require('configorama')
const pathExists = require('path-exists')

const getConfigPath = require('./path')

/* https://github.com/developit/dlv */
const dotPropGet = (obj, key, def, p) => {
  p = 0
  key = key.split ? key.split('.') : key
  while (obj && p < key.length) obj = obj[key[p++]]
  return obj === undefined || p < key.length ? def : obj
}

async function netlifyConfig(configFile, cliFlags) {
  const configPath = resolve(cwd(), configFile)

  if (!(await pathExists(configPath))) {
    throw new Error(`Configuration file does not exist: ${configPath}`)
  }

  const config = await configorama(configPath, {
    options: cliFlags,
    variableSources: [
      {
        /* Match variables ${secrets:xyz} */
        match: /^secrets:/g,
        async resolver() {
          // Call to remote secret store
          return 'shhhhhhh'
        }
      },
      {
        /* Match variables ${context:xyz} */
        match: /^context:/g,
        async resolver(varToProcess, opts, currentObject) {
          const objectPath = varToProcess.replace(/^context:/, '')
          const context = opts.context || 'production'
          const newValue = dotPropGet(`context.${context}.${objectPath}`, currentObject)
          const lookup = `\${self:${newValue}}`
          return lookup
        }
      }
    ]
  })

  const configA = Object.assign({ build: {} }, config)
  return configA
}

module.exports = netlifyConfig
/* Formatting utilities */
module.exports.formatUtils = configorama.format
/* Resolve Netlify config path */
module.exports.getConfigPath = getConfigPath
