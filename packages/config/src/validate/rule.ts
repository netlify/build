import * as z from 'zod'

import { throwUserError } from '../error.js'
import { THEME } from '../log/theme.js'

import { getExample } from './example.js'
import type { PathSegment, Rule } from './types.js'

interface RankedRule extends Rule {
  /** When several rules fail, the one with the lowest rank is reported. */
  rank: number
}

/** Rule definitions for one validation stage, ranked in the order they are declared. */
export const createRules = function () {
  let rank = 0
  return (rule: Rule): RankedRule => ({ ...rule, rank: rank++ })
}

type Check = readonly [rule: RankedRule, isValid: (value: unknown) => boolean]

/**
 * A value checked against `checks`, then parsed with `schema` if they all pass. `schema` must not
 * fail when the checks pass, since only the checks' rules have error messages.
 */
export const checked = function <Output>(schema: z.ZodType<Output>, ...checks: Check[]): z.ZodType<Output> {
  return checks
    .reduce<z.ZodType>((checkedSchema, check) => checkedSchema.check(toZodCheck(check)), z.unknown())
    .pipe(schema)
}

// Every failing rule is collected, including those after the first, so the lowest ranked one can be reported.
const toZodCheck =
  ([rule, isValid]: Check) =>
  (ctx: z.core.ParsePayload) => {
    if (!isValid(ctx.value)) {
      ctx.issues.push({ code: 'custom', input: ctx.value, message: rule.message, params: { rule }, continue: true })
    }
  }

/** An issue for `rule`, on `path` relative to the value being checked, for rules that need a child's key. */
export const ruleIssue = function (rule: RankedRule, input: unknown, path: PathSegment[]): z.core.$ZodRawIssue {
  return { code: 'custom', input, path, message: rule.message, params: { rule }, continue: true }
}

/**
 * Throw the error of the lowest ranked failing rule, if any. The input is returned rather than
 * the parsed data, which would have its properties in the schema's order.
 */
export const parseWithRules = function <Output>(schema: z.ZodType<Output>, config: unknown): Output {
  try {
    const result = schema.safeParse(config, { reportInput: true })
    if (result.success) {
      return config as Output
    }

    const [issue] = result.error.issues
      .flatMap((ruledIssue) => {
        const rule = getRule(ruledIssue)
        return rule === undefined ? [] : [{ ruledIssue, rule }]
      })
      .sort((left, right) => left.rule.rank - right.rule.rank)
    if (issue === undefined) {
      throw new Error(`Configuration failed a check without an error message: ${z.prettifyError(result.error)}`)
    }

    reportError(issue.ruledIssue, issue.rule)
  } catch (error) {
    // Any error is reported as a user error, including one from a check reading an unexpected
    // value or from serializing the invalid value in the message.
    throwUserError(error instanceof Error ? error : String(error))
  }
}

const getRule = function (issue: z.core.$ZodIssue): RankedRule | undefined {
  return issue.code === 'custom' ? (issue.params?.['rule'] as RankedRule | undefined) : undefined
}

// A function declaration, so that TypeScript treats calls to it as ending the code path.
function reportError(issue: z.core.$ZodIssue, { propertyName, message, example, formatInvalid }: Rule): never {
  const path = issue.path.map((segment) => (typeof segment === 'number' ? segment : String(segment)))
  const key = path.at(-1) ?? ''
  const label = path
    .map((segment, index) =>
      typeof segment === 'number' ? `[${String(segment)}]` : index === 0 ? segment : `.${segment}`,
    )
    .join('')
  throwUserError(`${THEME.highlightWords('Configuration property')} ${propertyName ?? label} ${message}
${getExample({ value: issue.input, key, path, example, formatInvalid })}`)
}
