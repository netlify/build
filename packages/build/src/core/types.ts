import { NetlifyConfig } from '../../types/index.js'

export type Mode = 'buildbot' | 'cli' | 'require'
export type BuildFlags = {
  /** Path to the configuration file */
  config?: string
  cwd?: string
  /** Git repository root directory. Used to retrieve the configuration file. */
  repositoryRoot?: string
  /** Netlify API endpoint */
  apiHost?: string
  /** Netlify API token for authentication */
  token?: string
  /** Netlify Site ID */
  siteId?: string
  /** Netlify Deploy ID */
  deployId?: string
  /** Build context */
  context?: string
  /** Repository branch */
  branch?: string
  /**
   * Run in dry mode, i.e. printing steps without executing them
   * @default false
   */
  dry?: boolean
  /** Path to the Node.js binary to use in the build command and plugins */
  nodePath?: string
  /**
   * Buffer output instead of printing it
   * @default false
   */
  buffer?: boolean

  mode?: Mode
}

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

export type ErrorParam = {
  errorMonitor: any
  mode: Mode
  logs: string[]
  debug: any
  testOpts?: any
  childEnv?: any
  netlifyConfig?: NetlifyConfig
}
