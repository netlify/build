const { addErrorInfo } = require('../../error/info')
const { serializeObject } = require('../../log/serialize')
const { THEME } = require('../../log/theme')

// Check that plugin inputs match the validation specified in "manifest.yml"
// Also assign default values
const checkInputs = function({ inputs, manifest: { inputs: rules = [] }, package, packageJson, loadedFrom, origin }) {
  try {
    const inputsA = addDefaults(inputs, rules)
    checkRequiredInputs({ inputs: inputsA, rules, package, packageJson, loadedFrom, origin })
    Object.keys(inputsA).map(name => checkInput({ name, rules, package, packageJson, loadedFrom, origin }))
    return inputsA
  } catch (error) {
    error.message = `${error.message}

${THEME.errorSubHeader('Plugin inputs')}
${serializeObject(inputs)}`
    throw error
  }
}

// Add "inputs[*].default"
const addDefaults = function(inputs, rules) {
  const defaults = rules.filter(hasDefault).map(getDefault)
  return Object.assign({}, ...defaults, inputs)
}

const hasDefault = function(rule) {
  return rule.default !== undefined
}

const getDefault = function({ name, default: defaultValue }) {
  return { [name]: defaultValue }
}

// Check "inputs[*].required"
const checkRequiredInputs = function({ inputs, rules, package, packageJson, loadedFrom, origin }) {
  const missingInputs = rules.filter(rule => isMissingRequired(inputs, rule))
  if (missingInputs.length === 0) {
    return
  }

  const names = missingInputs.map(getName)
  const error = new Error(`Required inputs for plugin "${package}": ${names.join(', ')}`)
  addInputError({ error, name: names[0], package, packageJson, loadedFrom, origin })
  throw error
}

const isMissingRequired = function(inputs, { name, required }) {
  return required && inputs[name] === undefined
}

const getName = function({ name }) {
  return name
}

// Check each "inputs[*].*" property for a specific input
const checkInput = function({ name, rules, package, packageJson, loadedFrom, origin }) {
  const ruleA = rules.find(rule => rule.name === name)
  if (ruleA === undefined) {
    const error = new Error(`Invalid input "${name}" for plugin "${package}".
Check your plugin configuration to be sure that:
  - the input name is spelled correctly
  - the input is included in the plugin's available configuration options
  - the plugin's input requirements have not changed`)
    addInputError({ error, name, package, packageJson, loadedFrom, origin })
    throw error
  }
}

// Add error information
const addInputError = function({ error, name, package, packageJson, loadedFrom, origin }) {
  addErrorInfo(error, {
    type: 'pluginInput',
    plugin: { package, packageJson },
    location: { event: 'load', package, input: name, loadedFrom, origin },
  })
}

module.exports = { checkInputs }
