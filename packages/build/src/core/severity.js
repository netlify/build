'use strict'

// Used to extract exit codes and respective status strings
// 1|2|3 indicate whether this was a user|plugin|system error.
const getSeverity = function (severity = FALLBACK_SEVERITY) {
  const severityEntry = severity in SEVERITY_MAP ? SEVERITY_MAP[severity] : SEVERITY_MAP[FALLBACK_SEVERITY]
  const success = severity === SUCCESS_SEVERITY
  return { success, ...severityEntry }
}

/* eslint-disable no-magic-numbers */
const SEVERITY_MAP = {
  success: { severityCode: 0, status: 'success' },
  none: { severityCode: 1, status: 'cancelled' },
  info: { severityCode: 2, status: 'user-error' },
  warning: { severityCode: 3, status: 'plugin-error' },
  error: { severityCode: 4, status: 'system-error' },
}
/* eslint-enable no-magic-numbers */
const SUCCESS_SEVERITY = 'success'
// Indicates a bug in our codebase
const FALLBACK_SEVERITY = 'error'

module.exports = { getSeverity }
