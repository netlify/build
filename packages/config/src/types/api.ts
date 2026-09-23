import type { NetlifyAPI } from '@netlify/api'

/** A site as returned by the Netlify API, or the subset known without calling it. */
export type SiteInfo = Partial<Awaited<ReturnType<NetlifyAPI['getSite']>>> & {
  feature_flags?: Record<string, string | number | boolean>
  use_envelope?: boolean
}

export interface MinimalAccount {
  id: string
  name: string
  slug: string
  default: boolean
  team_logo_url: string | null
  on_pro_trial: boolean
  organization_id: string | null
  type_name: string
  type_slug: string
  members_count: number
  /** Account-wide environment variables, for accounts that don't use the environment variables API. */
  site_env?: Record<string, string>
}

/** An extension installed on the site, as returned by the extension API. */
export interface Extension {
  author?: string
  extension_token?: string
  has_build: boolean
  name: string
  slug: string
  version: string
}

export interface ExtensionBuildPlugin {
  origin: 'local' | 'remote'
  packageURL: URL
}

export type ExtensionWithDev = Omit<Extension, 'author' | 'extension_token' | 'version'> & {
  author: string
  extension_token: string
  version: string
  buildPlugin: ExtensionBuildPlugin | null
  dev?: { path: string; force_run_in_build?: boolean } | null
}
