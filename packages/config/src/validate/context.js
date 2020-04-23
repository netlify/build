// `context.{context}.*` properties have the same validation as `build.*`
// They need separate ones though since their property name is different and
// so is their `example`.
const addContextValidations = function(validations) {
  return validations.flatMap(validation => addContextValidation({ validation }))
}

const addContextValidation = function({ validation, validation: { property, example } }) {
  if (!property.startsWith(BUILD_PREFIX)) {
    return [validation]
  }

  const propertyA = property.replace(BUILD_PREFIX, CONTEXT_PREFIX)
  const exampleA = getValidationExample.bind(null, example)
  return [validation, { ...validation, property: propertyA, example: exampleA }]
}

const BUILD_PREFIX = 'build.'
const CONTEXT_PREFIX = 'context.*.'

// Wrap `example` to return { context: { CONTEXT: ... } } instead of { build: ... }
const getValidationExample = function(example, ...args) {
  const { build } = example(...args)
  const context = args[2][1]
  return { context: { [context]: build } }
}

module.exports = { addContextValidations }
