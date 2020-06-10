const { log } = require('../../log/logger.js')

// Print event payload instead of sending actual request during tests
const printEventForTest = function(
  { name: errorClass, message: errorMessage },
  {
    context,
    groupingHash,
    severity,
    unhandled,
    _metadata: { location, plugin: { package, homepage } = {}, packageJson, env: { BUILD_ID } = {}, other },
  },
  logs,
) {
  const eventString = JSON.stringify(
    {
      errorClass,
      errorMessage,
      context,
      groupingHash,
      severity,
      unhandled,
      location,
      package,
      packageJson: packageJson !== undefined,
      homepage,
      BUILD_ID,
      other,
    },
    null,
    2,
  )
  log(logs, `\nError monitoring payload:\n${eventString}`)
}

module.exports = {
  printEventForTest,
}
