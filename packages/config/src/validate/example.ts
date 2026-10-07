import indentString from 'indent-string'

import { THEME } from '../log/theme.js'
import { serializeToml } from '../utils/toml.js'

import type { PathSegment, Rule } from './types.js'

type ExampleOptions = Pick<Rule, 'example' | 'formatInvalid'> & {
  value: unknown
  key: PathSegment
  path: PathSegment[]
}

/** The invalid value in context, and an example of valid configuration, as TOML. */
export const getExample = function ({ value, key, path, example, formatInvalid }: ExampleOptions): string {
  const validExample = typeof example === 'function' ? example(value, key, path) : example
  return `
${THEME.errorSubHeader('Invalid syntax')}

${indentString(getInvalidValue(value, path, formatInvalid), 2)}

${THEME.subHeader('Valid syntax')}

${indentString(serializeToml(validExample), 2)}`
}

const getInvalidValue = function (value: unknown, path: PathSegment[], formatInvalid: Rule['formatInvalid']) {
  const invalidConfig = path.reduceRight<unknown>((child, segment) => wrapInParent(child, segment), value)
  return serializeToml(formatInvalid === undefined ? invalidConfig : formatInvalid(invalidConfig))
}

const wrapInParent = function (child: unknown, segment: PathSegment): unknown {
  if (Number.isInteger(segment)) {
    return [child]
  }

  return child === undefined ? {} : { [segment]: child }
}
