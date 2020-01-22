const isPlainObj = require('is-plain-obj')

const { serializeList } = require('../../utils/list')

// Validate `plugin.outputs`
const validateOutputs = function(outputs) {
  if (!isPlainObj(outputs)) {
    throw new Error("Property 'outputs' must be a plain object")
  }

  Object.entries(outputs).forEach(validateOutput)
}

const validateOutput = function([name, output]) {
  if (!isPlainObj(output)) {
    throw new Error(`Property 'outputs.${name}' must be a plain object`)
  }

  Object.entries(output).forEach(([propName, value]) => validateOutputProp(name, propName, value))
}

const validateOutputProp = function(name, propName, value) {
  const validator = VALIDATORS[propName]

  if (validator === undefined) {
    throw new Error(`Invalid property 'outputs.${name}.${propName}'.
Please use a property name. One of:
${serializeList(Object.keys(VALIDATORS))}`)
  }

  validator(value, name)
}

const validateWhen = function(when, name) {
  if (typeof when !== 'string') {
    throw new Error(`Property 'outputs.${name}.when' must be a string`)
  }
}

const VALIDATORS = { when: validateWhen }

module.exports = { validateOutputs }
