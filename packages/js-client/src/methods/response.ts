import { JSONHTTPError, TextHTTPError } from 'micro-api-client'

import { BufferedResponse } from '../buffered_response.js'
import omit from '../omit.js'


import { getResponseType, ResponseType } from './response_type.js'

// Read and parse the HTTP response
export const parseResponse = async function (response: BufferedResponse | Response) {
  if (!(response instanceof Response)) {
    return response.body
  }

  const responseType = getResponseType(response)
  const textResponse = await response.text()

  const parsedResponse = parseJsonResponse(response, textResponse, responseType)

  if (!response.ok) {
    const ErrorType = responseType === 'json' ? JSONHTTPError : TextHTTPError
    throw addFallbackErrorMessage(new ErrorType(response, parsedResponse), textResponse)
  }

  return parsedResponse
}

const parseJsonResponse = function (response: Response, textResponse: string, responseType: ResponseType) {
  if (responseType === 'text') {
    return textResponse
  }

  try {
    return JSON.parse(textResponse)
  } catch {
    throw addFallbackErrorMessage(new TextHTTPError(response, textResponse), textResponse)
  }
}

const addFallbackErrorMessage = function (error, textResponse) {
  error.message = error.message || textResponse
  return error
}

export const getFetchError = function (error, url, opts) {
  const data = omit(opts, ['Authorization'])
  if (error.name !== 'FetchError') {
    error.name = 'FetchError'
  }
  error.url = url
  error.data = data
  return error
}
