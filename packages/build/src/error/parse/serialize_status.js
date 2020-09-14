// Serialize an error object to `statuses` properties
const serializeErrorStatus = function({ fullErrorInfo: { state, title, message, locationInfo, errorProps } }) {
  const text = getText({ locationInfo, errorProps })
  return { state, title, summary: message, text }
}

const getText = function({ locationInfo, errorProps }) {
  const parts = [locationInfo, getErrorProps(errorProps)].filter(Boolean)

  if (parts.length === 0) {
    return
  }

  return parts.join('\n\n')
}

const getErrorProps = function(errorProps) {
  if (errorProps === undefined) {
    return
  }

  return `Error properties:\n${errorProps}`
}

module.exports = { serializeErrorStatus }
