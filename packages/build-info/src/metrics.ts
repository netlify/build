import bugsnag, { type Client, NotifiableError } from '@bugsnag/js'

const { default: Bugsnag } = bugsnag

export type Severity = 'info' | 'warning' | 'error'

/** Report an error to bugsnag */
export function report(
  error: NotifiableError,
  options: {
    context?: string
    severity?: Severity
    metadata?: Record<string, Record<string, any>>
    client?: Client
  } = {},
) {
  ;(options.client || Bugsnag).notify(error, (event) => {
    for (const [section, values] of Object.entries(options.metadata || {})) {
      event.addMetadata(section, values)
    }
    event.severity = options.severity || 'error'
    event.context = options.context
  })
}
