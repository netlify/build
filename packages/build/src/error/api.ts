import type { NetlifyAPI } from '@netlify/api'

import { isPlainObject } from '../utils/is_plain_object.js'

import { addErrorInfo } from './info.js'

type ApiMethod = (...args: unknown[]) => unknown

// Wrap `api.*` methods so that they add more error information
export const addApiErrorHandlers = function (api: NetlifyAPI | undefined): Record<string, unknown> | undefined {
  if (api === undefined) {
    return
  }

  return Object.fromEntries(Object.entries(api).map(addErrorHandler))
}

const addErrorHandler = function ([key, value]: [string, unknown]): [string, unknown] {
  if (!isApiMethod(value)) {
    return [key, value]
  }

  const valueA = apiMethodHandler.bind(null, key, value)
  return [key, valueA]
}

const isApiMethod = function (value: unknown): value is ApiMethod {
  return typeof value === 'function'
}

const apiMethodHandler = async function (
  endpoint: string,
  method: ApiMethod,
  parameters: unknown,
  ...args: unknown[]
): Promise<unknown> {
  try {
    return await method(parameters, ...args)
  } catch (error) {
    redactError(error)
    addErrorInfo(error, { type: 'api', location: { endpoint, parameters } })
    throw error
  }
}

// Redact API token from the build logs
const redactError = function (error: unknown) {
  if (
    error instanceof Error &&
    'data' in error &&
    isPlainObjectValue(error.data) &&
    'headers' in error.data &&
    isPlainObjectValue(error.data.headers) &&
    'Authorization' in error.data.headers &&
    typeof error.data.headers.Authorization === 'string'
  ) {
    error.data.headers.Authorization = error.data.headers.Authorization.replace(HEX_REGEXP, 'HEX')
  }
}

// Narrowing to `object` instead of `Record<string, unknown>` lets `in` checks add the accessed keys
const isPlainObjectValue: (value: unknown) => value is object = isPlainObject

const HEX_REGEXP = /[\da-f]{6,}/g
