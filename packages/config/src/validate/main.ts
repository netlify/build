import { throwUserError } from '../error.js'
import { THEME } from '../log/theme.js'

import { getExample } from './example.js'
import type { PathSegment, Validation } from './types.js'
import {
  CONFIG_FILE_VALIDATIONS,
  POST_NORMALIZE_VALIDATIONS,
  PRE_CASE_NORMALIZE_VALIDATIONS,
  PRE_CONTEXT_VALIDATIONS,
  PRE_MERGE_VALIDATIONS,
  PRE_NORMALIZE_VALIDATIONS,
} from './validations.js'

/** Before properties are normalized to lower case. */
export const validatePreCaseNormalize = (config: object) => {
  validateConfig(config, PRE_CASE_NORMALIZE_VALIDATIONS)
}

/** Before a source is merged with the others. */
export const validatePreMergeConfig = (config: object) => {
  validateConfig(config, PRE_MERGE_VALIDATIONS)
}

/**
 * Only on the user's `netlify.toml`, for properties other origins such as the Frameworks API may
 * set but users may not.
 */
export const validateConfigFile = (config: object) => {
  validateConfig(config, CONFIG_FILE_VALIDATIONS)
}

/** Before contexts are merged. */
export const validatePreContextConfig = (config: object) => {
  validateConfig(config, PRE_CONTEXT_VALIDATIONS)
}

/** Before normalization. */
export const validatePreNormalizeConfig = (config: object) => {
  validateConfig(config, PRE_NORMALIZE_VALIDATIONS)
}

/** After normalization. */
export const validatePostNormalizeConfig = (config: object) => {
  validateConfig(config, POST_NORMALIZE_VALIDATIONS)
}

// Any error, including one from a check reading an unexpected value, is reported as a user error.
const validateConfig = function (config: object, validations: readonly Validation[]) {
  try {
    for (const validation of validations) {
      const [first, ...rest] = validation.property.split('.')
      validateProperty(config, first, rest, { path: [first], label: first }, validation)
    }
  } catch (error) {
    throwUserError(error instanceof Error ? error : String(error))
  }
}

/** Where a property is: its path, and how it's shown in error messages, e.g. `edge_functions[0].path`. */
type Location = { path: PathSegment[]; label: string }

const validateProperty = function (
  parent: unknown,
  segment: PathSegment,
  remainingSegments: string[],
  location: Location,
  validation: Validation,
) {
  const value = getChild(parent, segment)

  if (remainingSegments.length === 0) {
    if (value === undefined || validation.check(value, segment, location.path)) {
      return
    }

    reportError(value, segment, location, validation)
  }

  if (value === undefined) {
    return
  }

  const [nextSegment, ...rest] = remainingSegments
  if (nextSegment !== '*') {
    validateProperty(value, nextSegment, rest, descend(location, nextSegment, false), validation)
    return
  }

  // Like `Object.keys()` on any value, including throwing on `null`.
  const isArray = Array.isArray(value)
  for (const childKey of Object.keys(value as object)) {
    const childSegment = isArray ? Number(childKey) : childKey
    validateProperty(value, childSegment, rest, descend(location, childSegment, isArray), validation)
  }
}

// Like `parent[segment]` on any value, including throwing on `null`.
const getChild = (parent: unknown, segment: PathSegment): unknown => (parent as Record<PathSegment, unknown>)[segment]

const descend = ({ path, label }: Location, segment: PathSegment, isArrayIndex: boolean): Location => ({
  path: [...path, segment],
  label: isArrayIndex ? `${label}[${String(segment)}]` : `${label}.${String(segment)}`,
})

const reportError = function (
  value: unknown,
  key: PathSegment,
  { path, label }: Location,
  { propertyName = label, message, example, formatInvalid }: Validation,
): never {
  throwUserError(`${THEME.highlightWords('Configuration property')} ${propertyName} ${message}
${getExample({ value, key, path, example, formatInvalid })}`)
}
