// Normalize `status` field
export const normalizeStatus = function (status) {
  if (status === undefined) {
    return
  }

  const statusCode = transtypeStatusCode(status)
  if (!isValidStatusCode(statusCode)) {
    throw new Error(`Invalid status code: ${status}`)
  }
  return statusCode
}

// Transtype `status` string to a number.
// `status` might be a string ending with `!`. If so, `Number.parseInt()` strips
// and ignores it.
export const transtypeStatusCode = function (status) {
  return Number.parseInt(status)
}

// Check whether the field is a valid status code
export const isValidStatusCode = function (status) {
  return Number.isInteger(status)
}
