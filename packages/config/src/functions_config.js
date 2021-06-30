'use strict'

const isPlainObj = require('is-plain-obj')

const { isDefined } = require('./utils/remove_falsy')

const bundlers = ['esbuild', 'zisi']
const WILDCARD_ALL = '*'

// Removing the legacy `functions` from the `build` block.
// Looking for a default directory in the `functions` block, separating it
// from the rest of the configuration if it exists.
const normalizeFunctionsProps = function ({ functions: v1FunctionsDirectory, ...build }, functions) {
  const functionsA = Object.entries(functions).reduce(normalizeFunctionsProp, {})
  const { directory: functionsDirectory, functions: functionsB } = extractFunctionsDirectory(functionsA)
  const functionsDirectoryProps = getFunctionsDirectoryProps({ functionsDirectory, v1FunctionsDirectory })
  return { build, functions: functionsB, functionsDirectoryProps }
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
// If `prop` is one of `configProperties``, we might be dealing with a
// top-level property (i.e. one that targets all functions). We consider
// that to be the case if the value is an object where all keys are also
// config properties. If not, it's simply a function with the same name
// as one of the config properties.
const normalizeFunctionsProp = (functions, [propName, propValue]) =>
  isConfigProperty(propName) && !isConfigLeaf(propValue)
    ? { ...functions, [WILDCARD_ALL]: { ...functions[WILDCARD_ALL], [propName]: propValue } }
    : { ...functions, [propName]: propValue }

const isConfigLeaf = (functionConfig) =>
  isPlainObj(functionConfig) && Object.keys(functionConfig).every(isConfigProperty)

const isConfigProperty = (propName) => configProperties.has(propName)

const configProperties = new Set([
  'directory',
  'external_node_modules',
  'ignored_node_modules',
  'included_files',
  'node_bundler',
])

// Takes a functions configuration object and looks for the functions directory
// definition, returning it under the `directory` key. The rest of the config
// object is returned under the `functions` key.
const extractFunctionsDirectory = ({ [WILDCARD_ALL]: { directory, ...wildcardFunctionsConfig }, ...functions }) => ({
  directory,
  functions: { ...functions, [WILDCARD_ALL]: wildcardFunctionsConfig },
})

const getFunctionsDirectoryProps = ({ functionsDirectory, v1FunctionsDirectory }) => {
  if (isDefined(functionsDirectory)) {
    return {
      functionsDirectory,
      functionsDirectoryOrigin: 'config',
    }
  }

  if (isDefined(v1FunctionsDirectory)) {
    return {
      functionsDirectory: v1FunctionsDirectory,
      functionsDirectoryOrigin: 'config-v1',
    }
  }

  return {}
}

module.exports = { normalizeFunctionsProps, bundlers, WILDCARD_ALL }
