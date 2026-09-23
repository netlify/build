import type { NetlifyAPI } from '@netlify/api'

type ApiSite = Awaited<ReturnType<NetlifyAPI['getSite']>>

/** The UI build settings. `base` and `base_rel_dir` are returned by the API but missing from its published types. */
export type SiteBuildSettings = NonNullable<ApiSite['build_settings']> & {
  base?: string
  base_rel_dir?: boolean
}

/** A plugin installed in the UI. */
export interface UiPluginConfig {
  package: string
  inputs?: Record<string, unknown> | undefined
  pinned_version?: string | undefined
}

/** A site as returned by the Netlify API, or the subset known without calling it. */
export type SiteInfo = Partial<Omit<ApiSite, 'build_settings'>> & {
  build_settings?: SiteBuildSettings
  /** Plugins installed in the UI. Returned by the API but missing from its published types. */
  plugins?: UiPluginConfig[]
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
  author?: string | undefined
  extension_token?: string | undefined
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
  dev?: { path: string; force_run_in_build?: boolean } | null | undefined
}
