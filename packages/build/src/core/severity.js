// Used for example as exit codes.
// 1|2|3 indicate whether this was a user|plugin|system error.
const getSeverity = function(severity = FALLBACK_SEVERITY) {
  const severityCode = severity in SEVERITY_CODES ? SEVERITY_CODES[severity] : SEVERITY_CODES[FALLBACK_SEVERITY]
  const success = severity === SUCCESS_SEVERITY
  return { success, severityCode }
}

const SEVERITY_CODES = {
  none: 0,
  info: 1,
  warning: 2,
  error: 3,
}
const SUCCESS_SEVERITY = 'none'
// Indicates a bug in our codebase
const FALLBACK_SEVERITY = 'error'

module.exports = { getSeverity }
