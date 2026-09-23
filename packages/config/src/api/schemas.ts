import * as z from 'zod'

import type { MinimalAccount, SiteInfo } from '../types/api.js'

// These describe the published types, not the whole API response, so the API can add properties freely.

const optionalString = z.string().optional()

export const accountSchema: z.ZodType<MinimalAccount> = z.looseObject({
  slug: z.string(),
  site_env: z.record(z.string(), z.string()).optional(),
  id: optionalString,
  name: optionalString,
  default: z.boolean().optional(),
  team_logo_url: z.string().nullable().optional(),
  on_pro_trial: z.boolean().optional(),
  organization_id: z.string().nullable().optional(),
  type_name: optionalString,
  type_slug: optionalString,
  members_count: z.number().optional(),
})

export const accountsSchema = z.array(accountSchema)

const uiPluginSchema = z.looseObject({
  package: z.string(),
  inputs: z.record(z.string(), z.unknown()).exactOptional(),
  pinned_version: z.string().exactOptional(),
})

const buildSettingsSchema = z.looseObject({
  base: z.string().nullable().exactOptional(),
  base_rel_dir: z.boolean().nullable().exactOptional(),
  cmd: z.string().nullable().exactOptional(),
  dir: z.string().nullable().exactOptional(),
  env: z.record(z.string(), z.string()).nullable().exactOptional(),
  functions_dir: z.string().nullable().exactOptional(),
  repo_url: z.string().nullable().exactOptional(),
})

export const siteSchema: z.ZodType<SiteInfo> = z.looseObject({
  account_id: z.string().exactOptional(),
  account_slug: z.string().exactOptional(),
  build_settings: buildSettingsSchema.exactOptional(),
  feature_flags: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).exactOptional(),
  id: z.string().exactOptional(),
  name: z.string().exactOptional(),
  plugins: z.array(uiPluginSchema).exactOptional(),
  ssl_url: z.string().exactOptional(),
  use_envelope: z.boolean().exactOptional(),
})
