const USER_ERROR_TYPE = 'resolveConfig'

/**
 * An error caused by the user's configuration or options rather than by a bug. netlify-cli and
 * `@netlify/build` recognize these by `customErrorInfo.type`.
 */
export type UserError = Error & { customErrorInfo: { type: typeof USER_ERROR_TYPE } }

/**
 * Throw a user error. With an `Error` as `error`, its message is prefixed with `messageOrError` and
 * it is thrown instead of a new error, which keeps its stack trace.
 *
 * This is a function declaration so that TypeScript treats calls to it as ending the code path.
 */
export function throwUserError(messageOrError: string | Error, error?: unknown): never {
  const userError = toError(messageOrError, error) as UserError
  userError.customErrorInfo = { type: USER_ERROR_TYPE }
  throw userError
}

const toError = function (messageOrError: string | Error, error: unknown): Error {
  if (messageOrError instanceof Error) {
    return messageOrError
  }

  if (error === undefined) {
    return new Error(messageOrError)
  }

  if (error instanceof Error) {
    error.message = `${messageOrError}\n${error.message}`
    return error
  }

  return new Error(messageOrError, { cause: error })
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
