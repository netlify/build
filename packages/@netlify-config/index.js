const configorama = require('configorama')

const getConfigFile = require('./utils/hasConfig')

/* https://github.com/developit/dlv */
const dotPropGet = (obj, key, def, p) => {
  p = 0
  key = key.split ? key.split('.') : key
  while (obj && p < key.length) obj = obj[key[p++]]
  return obj === undefined || p < key.length ? def : obj
}

async function netlifyConfig(configFile, cliFlags) {
  const config = await configorama(configFile, {
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
  return config
}

module.exports = netlifyConfig
/* Formatting utilities */
module.exports.formatUtils = configorama.format
/* Resolve Netlify config path */
module.exports.getConfigFile = getConfigFile
