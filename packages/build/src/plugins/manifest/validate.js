import isPlainObj from 'is-plain-obj'

import { THEME } from '../../log/theme.js'

// Validate `manifest.yml` syntax
export const validateManifest = function (manifest, rawManifest) {
  try {
    validateBasic(manifest)
    validateUnknownProps(manifest)
    validateName(manifest)
    validateInputs(manifest)
  } catch (error) {
    error.message = `Plugin's "manifest.yml" ${error.message}

${THEME.errorSubHeader('manifest.yml')}
${rawManifest.trim()}`
    throw error
  }
}

const validateBasic = function (manifest) {
  if (!isPlainObj(manifest)) {
    throw new Error('must be a plain object')
  }
}

const validateUnknownProps = function (manifest) {
  const unknownProp = Object.keys(manifest).find((key) => !VALID_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`unknown property "${unknownProp}"`)
  }
}

const VALID_PROPS = new Set(['name', 'inputs'])

const validateName = function ({ name }) {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new TypeError('"name" property must be a string')
  }
}

const validateInputs = function ({ inputs }) {
  if (inputs === undefined) {
    return
  }

  if (!isArrayOfObjects(inputs)) {
    throw new Error('"inputs" property must be an array of objects')
  }

  inputs.forEach(validateInput)
}

const isArrayOfObjects = function (objects) {
  return Array.isArray(objects) && objects.every(isPlainObj)
}

const validateInput = function (input, index) {
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

const validateUnknownInputProps = function (input) {
  const unknownProp = Object.keys(input).find((key) => !VALID_INPUT_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`has an unknown property "${unknownProp}"`)
  }
}

const VALID_INPUT_PROPS = new Set(['name', 'description', 'required', 'default'])

const validateInputName = function ({ name }) {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new TypeError('"name" property must be a string')
  }
}

const validateInputDescription = function ({ description }) {
  if (description === undefined) {
    return
  }

  if (typeof description !== 'string') {
    throw new TypeError('"description" property must be a string')
  }
}

const validateInputRequired = function ({ required }) {
  if (required !== undefined && typeof required !== 'boolean') {
    throw new Error('"required" property must be a boolean')
  }
}
