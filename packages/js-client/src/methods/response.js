import omit from '../omit.js'

export class HTTPError extends Error {
  constructor(response) {
    super(response.statusText)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(response.statusText).stack
    }
    this.status = response.status
  }
}

export class TextHTTPError extends HTTPError {
  constructor(response, data) {
    super(response)
    this.data = data
  }
}

export class JSONHTTPError extends HTTPError {
  constructor(response, json) {
    super(response)
    this.json = json
  }
}

// Read and parse the HTTP response
export const parseResponse = async function (response) {
  const responseType = getResponseType(response)
  const textResponse = await response.text()

  const parsedResponse = parseJsonResponse(response, textResponse, responseType)

  if (!response.ok) {
    const ErrorType = responseType === 'json' ? JSONHTTPError : TextHTTPError
    throw addFallbackErrorMessage(new ErrorType(response, parsedResponse), textResponse)
  }

  return parsedResponse
}

const getResponseType = function ({ headers }) {
  const contentType = headers.get('Content-Type')

  if (contentType != null && contentType.includes('json')) {
    return 'json'
  }

  return 'text'
}

const parseJsonResponse = function (response, textResponse, responseType) {
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
