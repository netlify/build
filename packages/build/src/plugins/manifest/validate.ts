import { THEME } from '../../log/theme.js'
import { isPlainObject } from '../../utils/is_plain_object.js'

export type PluginManifestInput = {
  name: string
  description?: string
  required?: boolean
  default?: unknown
}

export type PluginManifest = {
  name: string
  inputs?: PluginManifestInput[]
}

// Validate `manifest.yml` syntax
export const validateManifest = function (manifest: unknown, rawManifest: string): void {
  try {
    const manifestObject = validateBasic(manifest)
    validateUnknownProps(manifestObject)
    validateName(manifestObject)
    validateInputs(manifestObject)
  } catch (error) {
    if (error instanceof Error) {
      error.message = `Plugin's "manifest.yml" ${error.message}

${THEME.errorSubHeader('manifest.yml')}
${rawManifest.trim()}`
    }
    throw error
  }
}

const validateBasic = function (manifest: unknown): Record<string, unknown> {
  if (!isPlainObject(manifest)) {
    throw new Error('must be a plain object')
  }

  return manifest
}

const validateUnknownProps = function (manifest: Record<string, unknown>): void {
  const unknownProp = Object.keys(manifest).find((key) => !VALID_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`unknown property "${unknownProp}"`)
  }
}

const VALID_PROPS = new Set(['name', 'inputs'])

const validateName = function ({ name }: Record<string, unknown>): void {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new TypeError('"name" property must be a string')
  }
}

const validateInputs = function ({ inputs }: Record<string, unknown>): void {
  if (inputs === undefined) {
    return
  }

  if (!isArrayOfObjects(inputs)) {
    throw new Error('"inputs" property must be an array of objects')
  }

  inputs.forEach(validateInput)
}

const isArrayOfObjects = function (objects: unknown): objects is Record<string, unknown>[] {
  return Array.isArray(objects) && objects.every(isPlainObject)
}

const validateInput = function (input: Record<string, unknown>, index: number): void {
  try {
    validateUnknownInputProps(input)
    validateInputName(input)
    validateInputDescription(input)
    validateInputRequired(input)
  } catch (error) {
    if (error instanceof Error) {
      error.message = `"inputs" property is invalid.
Input at position ${String(index)} ${error.message}.`
    }
    throw error
  }
}

const validateUnknownInputProps = function (input: Record<string, unknown>): void {
  const unknownProp = Object.keys(input).find((key) => !VALID_INPUT_PROPS.has(key))
  if (unknownProp !== undefined) {
    throw new Error(`has an unknown property "${unknownProp}"`)
  }
}

const VALID_INPUT_PROPS = new Set(['name', 'description', 'required', 'default'])

const validateInputName = function ({ name }: Record<string, unknown>): void {
  if (name === undefined) {
    throw new Error('must contain a "name" property')
  }

  if (typeof name !== 'string') {
    throw new TypeError('"name" property must be a string')
  }
}

const validateInputDescription = function ({ description }: Record<string, unknown>): void {
  if (description === undefined) {
    return
  }

  if (typeof description !== 'string') {
    throw new TypeError('"description" property must be a string')
  }
}

const validateInputRequired = function ({ required }: Record<string, unknown>): void {
  if (required !== undefined && typeof required !== 'boolean') {
    throw new Error('"required" property must be a boolean')
  }
}
