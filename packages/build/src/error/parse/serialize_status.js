// Serialize an error object to `statuses` properties
export const serializeErrorStatus = function ({ fullErrorInfo: { title, message, locationInfo, errorProps }, state }) {
  const text = getText({ locationInfo, errorProps })
  return { state, title, summary: message, text }
}

const getText = function ({ locationInfo, errorProps }) {
  const parts = [locationInfo, getErrorProps(errorProps)].filter(Boolean)

  if (parts.length === 0) {
    return
  }

  return parts.join('\n\n')
}

const getErrorProps = function (errorProps) {
  if (errorProps === undefined) {
    return
  }

  return `Error properties:\n${errorProps}`
}
