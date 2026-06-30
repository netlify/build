import type { ErrorMonitor } from './error_monitor.js'

export type TestOptions = {
  errorMonitor?: ErrorMonitor
  host?: string
  env?: boolean
  pluginsListUrl?: string
  skipPluginList?: boolean
  telemetryOrigin?: string
  telemetryTimeout?: number
  silentLingeringProcesses?: boolean
  scheme?: string
}
