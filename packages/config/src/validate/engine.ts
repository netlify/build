import indentString from 'indent-string'

import { tagUserError, throwUserError } from '../error.js'
import { THEME } from '../log.js'
import { serializeToml } from '../toml.js'

export type PathSegment = string | number

/**
 * A check on the configuration, and the error reported when it fails. Rules run in order and the
 * first failure is reported, so a rule on an object must come before the rules on its children.
 */
export interface Rule {
  /**
   * Dot-delimited path to the property. `*` stands for every property of an object, or every item
   * of an array, and requires an earlier rule to check the parent's type.
   */
  property: string
  /** Absent values always pass. */
  check: (value: unknown) => boolean
  message: string
  /** Valid configuration to show in the error message. */
  example: (path: PathSegment[]) => Record<string, unknown>
  /** Shown instead of the property path in error messages. */
  propertyName?: string
  /** Reshapes the invalid configuration shown in the error message. */
  formatInvalid?: (invalid: unknown) => unknown
}

// Anything thrown while checking, such as by serializing an invalid value, is a user error too.
export const validate = function (config: unknown, rules: readonly Rule[]): void {
  try {
    for (const rule of rules) {
      validateProperty(config, rule, rule.property.split('.'), [], '')
    }
  } catch (error) {
    throw error instanceof Error ? tagUserError(error) : tagUserError(new Error(String(error)))
  }
}

const validateProperty = function (
  parent: unknown,
  rule: Rule,
  [segment, ...nextSegments]: string[],
  path: PathSegment[],
  label: string,
): void {
  if (segment === undefined || parent === undefined || parent === null) {
    return
  }

  if (segment === '*') {
    for (const key of Object.keys(parent)) {
      const childKey = Array.isArray(parent) ? Number(key) : key
      const childLabel = Array.isArray(parent) ? `${label}[${key}]` : `${label}.${key}`
      validateValue(getChild(parent, childKey), rule, nextSegments, [...path, childKey], childLabel)
    }
    return
  }

  validateValue(
    getChild(parent, segment),
    rule,
    nextSegments,
    [...path, segment],
    label === '' ? segment : `${label}.${segment}`,
  )
}

const validateValue = function (
  value: unknown,
  rule: Rule,
  nextSegments: string[],
  path: PathSegment[],
  label: string,
): void {
  if (nextSegments.length !== 0) {
    validateProperty(value, rule, nextSegments, path, label)
    return
  }

  if (value === undefined || rule.check(value)) {
    return
  }

  throwUserError(`${THEME.highlightWords('Configuration property')} ${rule.propertyName ?? label} ${rule.message}
${getExample(value, path, rule)}`)
}

// Reading a property is valid on any non-nullish value, and yields `undefined` on primitives.
const getChild = (parent: unknown, key: PathSegment): unknown => (parent as Record<PathSegment, unknown>)[key]

const getExample = function (value: unknown, path: PathSegment[], rule: Rule): string {
  const invalid = path.reduceRight<unknown>(wrapInParent, value)
  return `
${THEME.errorSubHeader('Invalid syntax')}

${indentString(serializeToml(rule.formatInvalid === undefined ? invalid : rule.formatInvalid(invalid)), 2)}

${THEME.subHeader('Valid syntax')}

${indentString(serializeToml(rule.example(path)), 2)}`
}

// Array items are shown alone in their array, so the message shows only the invalid one.
const wrapInParent = (child: unknown, segment: PathSegment): unknown =>
  typeof segment === 'number' ? [child] : child === undefined ? {} : { [segment]: child }
