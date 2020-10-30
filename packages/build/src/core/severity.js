'use strict'

// Used for example as exit codes.
// 1|2|3 indicate whether this was a user|plugin|system error.
const getSeverity = function (severity = FALLBACK_SEVERITY) {
  const severityCode = severity in SEVERITY_CODES ? SEVERITY_CODES[severity] : SEVERITY_CODES[FALLBACK_SEVERITY]
  const success = severity === SUCCESS_SEVERITY
  return { success, severityCode }
}

/* eslint-disable no-magic-numbers */
const SEVERITY_CODES = {
  success: 0,
  none: 1,
  info: 2,
  warning: 3,
  error: 4,
}
/* eslint-enable no-magic-numbers */
const SUCCESS_SEVERITY = 'success'
// Indicates a bug in our codebase
const FALLBACK_SEVERITY = 'error'

module.exports = { getSeverity }
