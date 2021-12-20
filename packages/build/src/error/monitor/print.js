import { log } from '../../log/logger.js'

// Print event payload instead of sending actual request during tests
export const printEventForTest = function (
  { name: errorClass, message: errorMessage },
  {
    context,
    groupingHash,
    severity,
    unhandled,
    _metadata: {
      location,
      plugin: { packageName, homepage } = {},
      pluginPackageJson,
      tsConfig,
      env: { BUILD_ID } = {},
      other,
    },
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
      packageName,
      pluginPackageJson: pluginPackageJson !== undefined,
      homepage,
      tsConfig,
      BUILD_ID,
      other,
    },
    null,
    2,
  )
  log(logs, `\nError monitoring payload:\n${eventString}`)
}
