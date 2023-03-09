import { NetlifyConfig } from '../../types/index.js'

export type Mode = 'buildbot' | 'cli' | 'require'

export type BuildResult = {
  success: boolean
  severityCode: SeverityCode
  netlifyConfig?: NetlifyConfig
  configMutations?: any
  logs?: string[]
}

export enum SeverityCode {
  success = 1,
  buildCancelled,
  userError,
  pluginError,
  systemError,
}

export type TestOptions = {
  errorMonitor?: any
}

export type ErrorParam = {
  errorMonitor: any
  mode: Mode
  logs: string[]
  debug: any
  testOpts?: TestOptions
  childEnv?: any
  netlifyConfig?: NetlifyConfig
}
