const isPlainObj = require('is-plain-obj')

const { serializeArray } = require('../../log/serialize')
const { THEME } = require('../../log/theme')
const { API_METHODS } = require('../child/api')

// Validate `manifest.yml` syntax
const validateManifest = function(manifest, rawManifest) {
  try {
    validateBasic(manifest)
    validateUnknownProps(manifest)
    validateName(manifest)
    validateScopes(manifest)
    validateInputs(manifest)
  } catch (error) {
    error.message = `Plugin's "manifest.yml" ${error.message}

${THEME.errorSubHeader('manifest.yml')}
${rawManifest.trim()}`
    throw error
  }
}

const validateBasic = function(manifest) {
  if (!isPlainObj(manifest)) {
    throw new Error('must be a plain object')
  }
}

const validateUnknownProps = function(manifest) {
  const unknownProp = Object.keys(manifest).find(key => !VALID_PROPS.includes(key))
  if (unknownProp !== undefined) {
    throw new Error(`unknown property "${unknownProp}"`)
  }
}

const VALID_PROPS = ['name', 'inputs', 'scopes']

const validateName = function({ name }) {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new Error('"name" property must be a string')
  }
}

const validateScopes = function({ scopes }) {
  if (scopes === undefined) {
    return
  }

  if (!Array.isArray(scopes)) {
    throw new Error('"scopes" property must be an array')
  }

  const wrongScope = scopes.find(scope => !isValidScope(scope))
  if (wrongScope !== undefined) {
    throw new Error(`scope "${wrongScope}" is invalid
Please use a valid scope. One of:
${serializeArray(ALLOWED_SCOPES)}`)
  }
}

const isValidScope = function(scope) {
  return ALLOWED_SCOPES.includes(scope)
}

const ALLOWED_SCOPES = ['*', ...API_METHODS]

const validateInputs = function({ inputs }) {
  if (inputs === undefined) {
    return
  }

  if (!isArrayOfObjects(inputs)) {
    throw new Error('"inputs" property must be an array of objects')
  }

  inputs.forEach(validateInput)
}

const isArrayOfObjects = function(objects) {
  return Array.isArray(objects) && objects.every(isPlainObj)
}

const validateInput = function(input, index) {
  try {
    validateUnknownInputProps(input)
    validateInputName(input)
    validateInputDescription(input)
    validateInputRequired(input)
  } catch (error) {
    error.message = `"inputs" property is invalid.
Input at position ${index} ${error.message}.`
    throw error
  }
}

const validateUnknownInputProps = function(input) {
  const unknownProp = Object.keys(input).find(key => !VALID_INPUT_PROPS.includes(key))
  if (unknownProp !== undefined) {
    throw new Error(`has an unknown property "${unknownProp}"`)
  }
}

const VALID_INPUT_PROPS = ['name', 'description', 'required', 'default']

const validateInputName = function({ name }) {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new Error('"name" property must be a string')
  }
}

const validateInputDescription = function({ description }) {
  if (description === undefined) {
    return
  }

  if (typeof description !== 'string') {
    throw new Error('"description" property must be a string')
  }
}

const validateInputRequired = function({ required }) {
  if (required !== undefined && typeof required !== 'boolean') {
    throw new Error('"required" property must be a boolean')
  }
}

module.exports = { validateManifest }
