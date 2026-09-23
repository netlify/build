import { log, type Logs } from '../../log/logger.js'

type EventProps = {
  context: unknown
  groupingHash: string
  severity: string
  unhandled: boolean
  _metadata: {
    location?: unknown
    plugin?: { packageName?: string; homepage?: string | undefined }
    pluginPackageJson?: unknown
    tsConfig?: unknown
    env?: Record<string, string | undefined>
    other?: unknown
  }
}

// Print event payload instead of sending actual request during tests
export const printEventForTest = function (
  { name: errorClass, message: errorMessage }: Pick<Error, 'name' | 'message'>,
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
  }: EventProps,
  logs: Logs | undefined,
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
