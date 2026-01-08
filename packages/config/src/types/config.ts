import { type NetlifyAPI } from '@netlify/api'

import { type MinimalAccount, type SiteInfo } from '../api/site_info.js'
import { type ExtensionWithDev } from '../extensions.js'

export type Integrations = ExtensionWithDev[]

export type Config = {
  accounts?: MinimalAccount[] | undefined
  api?: NetlifyAPI | undefined
  branch?: string
  buildDir?: string
  config?: Record<string, any>
  configPath?: string | undefined
  context?: string
  env?: Record<string, string | undefined>
  headersPath?: string | undefined
  integrations?: Integrations
  logs?: any
  redirectsPath?: string | undefined
  repositoryRoot?: string
  siteInfo?: SiteInfo['siteInfo']
  token?: string
}
