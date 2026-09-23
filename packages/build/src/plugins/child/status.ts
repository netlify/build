import { addErrorInfo } from '../../error/info.js'
import type { Status } from '../../status/add.js'
import { isPlainObject } from '../../utils/is_plain_object.js'

export type RunState = { status?: Status }

type ShowArgs = {
  title?: string | undefined
  summary: string
  text?: string | undefined
  extraData?: unknown[] | undefined
}

// Report status information to the UI
export const show = function (runState: RunState, showArgs: unknown): void {
  validateShowArgs(showArgs)
  const { title, summary, text, extraData } = removeEmptyStrings(showArgs)
  runState.status = { state: 'success', title, summary, text, extraData }
}

// Validate arguments of `utils.status.show()`
function validateShowArgs(showArgs: unknown): asserts showArgs is ShowArgs {
  try {
    validateShowArgsObject(showArgs)
    const { title, summary, text, extraData, ...otherArgs } = showArgs
    validateShowArgsKeys(otherArgs)
    Object.entries({ title, summary, text }).forEach(validateStringArg)
    validateShowArgsSummary(summary)
    validateShowArgsExtraData(extraData)
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error
    }
    error.message = `utils.status.show() ${error.message}`
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

function validateShowArgsObject(showArgs: unknown): asserts showArgs is Record<string, unknown> {
  if (showArgs === undefined) {
    throw new Error('requires an argument')
  }

  if (!isPlainObject(showArgs)) {
    throw new Error('argument must be a plain object')
  }
}

const validateShowArgsKeys = function (otherArgs: Record<string, unknown>) {
  const otherKeys = Object.keys(otherArgs).map((arg) => `"${arg}"`)
  if (otherKeys.length !== 0) {
    throw new Error(`must only contain "title", "summary" or "text" properties, not ${otherKeys.join(', ')}`)
  }
}

const validateStringArg = function ([key, value]: [string, unknown]) {
  if (value !== undefined && typeof value !== 'string') {
    throw new Error(`"${key}" property must be a string`)
  }
}

const validateShowArgsSummary = function (summary: unknown) {
  if (typeof summary !== 'string' || summary.trim() === '') {
    throw new Error('requires specifying a "summary" property')
  }
}

const validateShowArgsExtraData = function (extraData: unknown) {
  if (extraData !== undefined && !Array.isArray(extraData)) {
    throw new TypeError('provided extra data must be an array')
  }
}

const removeEmptyStrings = function (showArgs: ShowArgs): { [K in keyof ShowArgs]?: ShowArgs[K] | undefined } {
  return Object.fromEntries(Object.entries(showArgs).map(removeEmptyString)) as {
    [K in keyof ShowArgs]?: ShowArgs[K] | undefined
  }
}

const removeEmptyString = function ([key, value]: [string, unknown]) {
  if (typeof value === 'string' && value.trim() === '') {
    return [key]
  }

  return [key, value]
}
