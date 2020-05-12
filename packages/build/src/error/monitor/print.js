const { log } = require('../../log/logger.js')

// Print event payload instead of sending actual request during tests
const printEventForTest = function({
  errors: [{ errorClass, errorMessage }],
  context,
  groupingHash,
  severity,
  unhandled,
  app: { releaseStage, version, type },
  device: {
    runtimeVersions: { node },
  },
  _metadata: { location, plugin: { package } = {}, other },
}) {
  const eventString = JSON.stringify(
    {
      errorClass,
      errorMessage,
      context,
      groupingHash,
      severity,
      unhandled,
      releaseStage,
      version,
      type,
      node,
      location,
      package,
      other,
    },
    null,
    2,
  )
  log(`\nError monitoring payload:\n${eventString}`)
}

module.exports = {
  printEventForTest,
}
