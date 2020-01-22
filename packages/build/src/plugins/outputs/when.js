const isPlainObj = require('is-plain-obj')
const omit = require('omit.js')

// Retrieve `plugin.config.properties.*.when`
const getOutputs = function({ config: configSchema, ...logicA }) {
  if (configSchema === undefined) {
    return { ...logicA, outputs: [] }
  }

  const { configSchema: configSchemaA, outputs } = parseOutputs(configSchema)
  return { ...logicA, config: configSchemaA, outputs }
}

const parseOutputs = function({ properties = {}, ...configSchema }) {
  const propertiesA = Object.entries(properties).filter(isValidProperty)
  const outputs = propertiesA.map(getOutput).filter(Boolean)
  const propertiesB = Object.assign({}, ...propertiesA.map(buildProperty))
  return { configSchema: { ...configSchema, properties: propertiesB }, outputs }
}

const isValidProperty = function([, property]) {
  return isPlainObj(property)
}

const getOutput = function([varName, { when: event }]) {
  if (event === undefined) {
    return
  }

  return { varName, event }
}

const buildProperty = function([varName, property]) {
  const propertyA = omit(property, ['when'])
  return { [varName]: propertyA }
}

module.exports = { getOutputs, parseOutputs }
