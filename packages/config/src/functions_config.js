'use strict'

const isPlainObj = require('is-plain-obj')

const bundlers = ['esbuild', 'zisi']
const configProperties = new Set([
  'directory',
  'external_node_modules',
  'ignored_node_modules',
  'included_files',
  'node_bundler',
])

const WILDCARD_ALL = '*'

const isConfigLeaf = (obj) => isPlainObj(obj) && Object.keys(obj).every(isConfigProperty)

const isConfigProperty = (prop) => configProperties.has(prop)

// Takes a functions configuration object and looks for the functions directory
// definition, returning it under the `directory` key. The rest of the config
// object is returned under the `functions` key.
const extractFunctionsDirectory = (functions = {}) => {
  const { [WILDCARD_ALL]: topLevelConfig = {}, ...otherFunctions } = functions
  const { directory, ...topLevelConfigKeys } = topLevelConfig
  const newTopLevelConfig = Object.keys(topLevelConfigKeys).length === 0 ? {} : { [WILDCARD_ALL]: topLevelConfigKeys }

  return {
    directory,
    functions: {
      ...otherFunctions,
      ...newTopLevelConfig,
    },
  }
}

// Normalizes a functions configuration object, so that the first level of keys
// represents function expressions mapped to a configuration object.
//
// Example input:
// {
//   "external_node_modules": ["one"],
//   "my-function": { "external_node_modules": ["two"] }
// }
//
// Example output:
// {
//   "*": { "external_node_modules": ["one"] },
//   "my-function": { "external_node_modules": ["two"] }
// }
const normalize = (functions) => {
  const normalizedFunctions = Object.keys(functions).reduce((result, prop) => {
    // If `prop` is one of `configProperties``, we might be dealing with a
    // top-level property (i.e. one that targets all functions). We consider
    // that to be the case if the value is an object where all keys are also
    // config properties. If not, it's simply a function with the same name
    // as one of the config properties.
    if (isConfigProperty(prop) && !isConfigLeaf(functions[prop])) {
      return {
        ...result,
        [WILDCARD_ALL]: {
          ...result[WILDCARD_ALL],
          [prop]: functions[prop],
        },
      }
    }

    return {
      ...result,
      [prop]: functions[prop],
    }
  }, {})

  return normalizedFunctions
}

module.exports = { bundlers, extractFunctionsDirectory, normalize, WILDCARD_ALL }
