const USER_ERROR_TYPE = 'resolveConfig'

/**
 * Caused by the user's configuration or options, not a bug. Consumers check `customErrorInfo.type`,
 * and `@netlify/build` rewrites `customErrorInfo` in place, so it must stay a plain, writable object.
 */
export type UserError = Error & { customErrorInfo: { type: typeof USER_ERROR_TYPE } }

/**
 * With an `Error` as `cause`, that error is thrown instead of a new one, with `message` prepended
 * to its own: this keeps its class, `code` and stack.
 */
export function throwUserError(message: string, cause?: unknown): never {
  throw toUserError(message, cause)
}

export const tagUserError = function (error: Error): UserError {
  return Object.assign(error, { customErrorInfo: { type: USER_ERROR_TYPE } } as const)
}

const toUserError = function (message: string, cause: unknown): UserError {
  if (cause instanceof Error) {
    cause.message = `${message}\n${cause.message}`
    return tagUserError(cause)
  }

  return tagUserError(cause === undefined ? new Error(message) : new Error(message, { cause }))
}

export const isUserError = function (error: unknown): error is UserError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'customErrorInfo' in error &&
    typeof error.customErrorInfo === 'object' &&
    error.customErrorInfo !== null &&
    'type' in error.customErrorInfo &&
    error.customErrorInfo.type === USER_ERROR_TYPE
  )
}

/** Bugs get the prefix too, not only user errors. */
export const prefixError = function (error: unknown, prefix: string): unknown {
  if (error instanceof Error) {
    error.message = `${prefix}:\n${error.message}`
  }
  return error
}

export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))
