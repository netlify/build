import type { BuildError } from '../types.js'

type ErrorState = 'failed_build' | 'failed_plugin' | 'canceled_build'

/* Serialize an error object to `statuses` properties */
export const serializeErrorStatus = function ({
  fullErrorInfo: { title, message, locationInfo, errorProps, errorMetadata },
  state,
}: {
  fullErrorInfo: BuildError
  state: ErrorState
}) {
  const text = getText({ locationInfo, errorProps })
  return { state, title, summary: message, text, extraData: errorMetadata }
}

const getText = function ({ locationInfo, errorProps }) {
  const parts = [locationInfo, getErrorProps(errorProps)].filter(Boolean)

  if (parts.length === 0) {
    return
  }

  return parts.join('\n\n')
}

const getErrorProps = function (errorProps: string | undefined) {
  if (errorProps === undefined) {
    return
  }

  return `Error properties:\n${errorProps}`
}
