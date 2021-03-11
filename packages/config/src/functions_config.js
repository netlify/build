'use strict'

const isPlainObj = require('is-plain-obj')

const configProperties = new Set(['externalModules', 'ignoredModules'])

const WILDCARD_ALL = '*'

const isConfigLeaf = (obj) => isPlainObj(obj) && Object.keys(obj).every(isConfigProperty)

const isConfigProperty = (prop) => configProperties.has(prop)

const normalize = (config) => {
  if (!config) {
    return config
  }

  const normalizedConfig = Object.keys(config).reduce((result, prop) => {
    // If `prop` is one of `configProperties``, we might be dealing with a
    // top-level property (i.e. one that targets all functions). We consider
    // that to be the case if the value is an object where all keys are also
    // config properties. If not, it's simply a function with the same name
    // as one of the config properties.
    if (isConfigProperty(prop) && !isConfigLeaf(config[prop])) {
      return {
        ...result,
        [WILDCARD_ALL]: {
          ...result[WILDCARD_ALL],
          [prop]: config[prop],
        },
      }
    }

    return {
      ...result,
      [prop]: config[prop],
    }
  }, {})

  return normalizedConfig
}

module.exports = { normalize }
