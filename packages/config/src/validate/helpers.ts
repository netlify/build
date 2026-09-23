import isPlainObj from 'is-plain-obj'

import type { Validation } from './types.js'

export const isString = (value: unknown): value is string => typeof value === 'string'

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isArrayOfObjects = (value: unknown): value is Record<string, unknown>[] =>
  Array.isArray(value) && value.every(isPlainObj)

export const isArrayOfStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)

/** Check that an object only has the given properties. Legacy properties are allowed but not listed in the message. */
export const validProperties = function (
  propNames: readonly string[],
  legacyPropNames: readonly string[],
): Pick<Validation, 'check' | 'message'> {
  const allowed = new Set([...propNames, ...legacyPropNames])
  return {
    // Checks only run on defined values, and earlier validations ensure these are objects.
    check: (value) => Object.keys(value as object).every((propName) => allowed.has(propName)),
    message: `has unknown properties. Valid properties are:
${propNames.map((propName) => `  - ${propName}`).join('\n')}`,
  }
}

/** `functionsDirectory` comes from `functions.directory`, so errors are reported against the latter. */
export const functionsDirectoryCheck: Pick<Validation, 'formatInvalid' | 'propertyName'> = {
  formatInvalid: (invalid) => ({
    functions: { directory: isPlainObj(invalid) ? invalid['functionsDirectory'] : undefined },
  }),
  propertyName: 'functions.directory',
}
