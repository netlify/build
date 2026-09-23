import type { NetlifyAPI } from '@netlify/api'

import type { ExtensionWithDev, MinimalAccount, SiteInfo } from './api.js'
import type { ResolvedNetlifyConfig } from './config.js'
import type { BufferedLogs } from './logs.js'

/** Where an environment variable was set. Earlier sources take precedence over later ones. */
export type EnvironmentVariableSource = 'configFile' | 'ui' | 'account' | 'general' | 'internal'

export interface EnvironmentVariable {
  /** Every source that sets the variable, highest precedence first. */
  sources: EnvironmentVariableSource[]
  value: string
}

/** The result of `resolveConfig`. */
export interface Config {
  accounts: MinimalAccount[]
  /** The Netlify API client. Undefined without a token, or when offline. */
  api?: NetlifyAPI | undefined
  branch: string
  buildDir: string
  config: ResolvedNetlifyConfig
  /** Undefined when there is no configuration file. */
  configPath?: string | undefined
  context: string
  env: Record<string, EnvironmentVariable>
  /** Path to the `_headers` file, which may not exist. */
  headersPath: string
  integrations: ExtensionWithDev[]
  /** Only set with the `buffer` option. */
  logs?: BufferedLogs | undefined
  /** Path to the `_redirects` file, which may not exist. */
  redirectsPath: string
  repositoryRoot: string
  siteInfo: SiteInfo
  token?: string | undefined
}
