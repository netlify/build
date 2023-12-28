import bugsnag, { type Client, NotifiableError } from '@bugsnag/js'

const { default: Bugsnag } = bugsnag

export type Severity = 'info' | 'warning' | 'error'

/** Normalize an error to the NotifiableError type */
const normalizeError = (error: any): NotifiableError => {
  // Already in an acceptable NotifiableError format
  if (error instanceof Error) {
    return error
  }
  if (typeof error === 'object' && (error.errorClass || error.name)) {
    return error
  }
  if (typeof error === 'string') {
    // BugSnag suggest sending an Error rather than string to get better stack traces
    return new Error(error)
  }

  // If the error is an object with a message, create a generic Error
  if (typeof error === 'object' && error.message) {
    return new Error(error.message)
  }

  // If the error format is unexpected, create a generic Error
  return new Error(`Unexpected error format: ${JSON.stringify(error)}`)
}

/** Report an error to bugsnag */
export function report(
  error: NotifiableError | Record<string, Record<string, any>>,
  options: {
    context?: string
    severity?: Severity
    metadata?: Record<string, Record<string, any>>
    client?: Client
  } = {},
) {
  const normalizedError = normalizeError(error)
  const client = options.client || Bugsnag

  client.notify(normalizedError, (event) => {
    for (const [section, values] of Object.entries(options.metadata || {})) {
      event.addMetadata(section, values)
    }
    // If the error is an object with a documentation_url property, it's probably a GitHub API error
    if (typeof error === 'object' && 'documentation_url' in error) {
      event.addMetadata('Documentation URL', error.documentation_url)
    }
    event.context = options.context
    event.severity = options.severity || 'error'
    event.context = options.context
  })
}
