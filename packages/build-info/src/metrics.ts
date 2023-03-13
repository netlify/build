import bugsnag, { NotifiableError } from '@bugsnag/js'

const { default: Bugsnag } = bugsnag

/** Report an error to bugsnag */
export function report(
  error: NotifiableError,
  options: {
    context?: 'string'
    severity?: 'info' | 'warning' | 'error'
    metadata?: Record<string, Record<string, any>>
  } = {},
) {
  Bugsnag.notify(error, (event) => {
    for (const [section, values] of Object.entries(options.metadata || {})) {
      event.addMetadata(section, values)
    }
    event.severity = options.severity || 'error'
    event.context = options.context
  })
}
