import type { ErrorInfo, ErrorLocation, PluginLocation } from './types.js'

// `plugins/manifest/check.ts` types a plugin location's `loadedFrom` and `origin` as `unknown`, although they are strings
type AddedErrorInfo = Omit<ErrorInfo, 'location'> & {
  location?: ErrorLocation | (Omit<PluginLocation, 'loadedFrom' | 'origin'> & { loadedFrom: unknown; origin: unknown })
}

type ErrorWithAddedInfo = { [CUSTOM_ERROR_KEY]?: AddedErrorInfo }

// Add information related to an error without colliding with existing properties
export const addDefaultErrorInfo = function (error: unknown, info: AddedErrorInfo) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...info, ...error[CUSTOM_ERROR_KEY] }
}

// Retrieve error information added by our system
export const addErrorInfo = function (error: unknown, info: AddedErrorInfo) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...error[CUSTOM_ERROR_KEY], ...info }
}

export const getErrorInfo = function <T>(error: T): [ErrorInfo, T | Omit<T, typeof CUSTOM_ERROR_KEY>] {
  if (!isBuildError(error)) {
    return [{}, error]
  }

  const { [CUSTOM_ERROR_KEY]: errorInfo, ...errorA } = error
  return [errorInfo, errorA]
}

// Change error type from one to another
export const changeErrorType = function (error: unknown, oldType: string, newType: string) {
  const [{ type }] = getErrorInfo(error)
  if (type === oldType) {
    addErrorInfo(error, { type: newType })
  }
}

// Error information also comes from dependencies and from plugins through IPC, and is not validated
export const isBuildError = function (error: unknown): error is { [CUSTOM_ERROR_KEY]: ErrorInfo } {
  return canHaveErrorInfo(error) && error[CUSTOM_ERROR_KEY] !== undefined
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `CUSTOM_ERROR_KEY` property. Other primitives pass: assigning to them throws.
const canHaveErrorInfo = function (error: unknown): error is ErrorWithAddedInfo {
  return error != null
}

export const CUSTOM_ERROR_KEY = 'customErrorInfo'
