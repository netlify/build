import fs from 'node:fs/promises'

import type { NetlifyAPI } from '@netlify/api'
import * as z from 'zod'

// TODO: There are likely fields missing here, and many of these fields are probably optional.
export const SerializedCachedConfigSchema = z.object({
  accounts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      default: z.boolean(),
      team_logo_url: z.string().nullable(),
      on_pro_trial: z.boolean(),
      organization_id: z.string().nullable(),
      type_name: z.string(),
      type_slug: z.string(),
      members_count: z.number(),
    }),
  ),
  branch: z.string(),
  buildDir: z.string(),
  config: z.object({
    build: z.object({
      edge_functions: z.string().optional(),
      environment: z.record(
        z.string(),
        z.object({
          sources: z.array(z.string()), // z.array(z.enum(['internal', 'ui', ...])),
          value: z.string(),
        }),
      ),
      functions: z.string().optional(),
      publish: z.string(),
      publishOrigin: z.string(), // z.enum(['config']),
      processing: z.record(z.string(), z.unknown()),
      services: z.record(z.string(), z.unknown()),
      command: z.string(),
      commandOrigin: z.string(), // z.enum(['config', ...])
    }),
    functions: z.record(z.string(), z.record(z.string(), z.unknown())),
    functionsDirectory: z.string().optional(),
    functionsDirectoryOrigin: z.string().optional(), // z.enum(['config', 'default', 'default-v1', 'ui', ...]),
    plugins: z.array(
      z.object({
        origin: z.string(), // z.enum(['config', ...])
        package: z.string(),
        inputs: z.record(z.string(), z.unknown()),
      }),
    ),
    headers: z.array(z.unknown()),
    redirects: z.array(z.unknown()),
  }),
  configPath: z.string(),
  context: z.string(), // z.enum(['production', 'deploy-preview', 'branch-deploy', 'dev', 'dev-server']),
  env: z.record(
    z.string(),
    z.object({
      sources: z.array(z.string()), // z.array(z.enum(['internal', 'ui', ...])),
      value: z.string(),
    }),
  ),
  integrations: z.array(
    z.object({
      author: z.string(),
      buildPlugin: z.object({
        origin: z.string(),
        packageURL: z.string(),
      }),
      extension_token: z.string(),
      has_build: z.boolean(),
      name: z.string(),
      slug: z.string(),
      version: z.string(),
    }),
  ),
  hasApi: z.boolean().optional(),
  headersPath: z.string(),
  siteInfo: z.record(z.string(), z.unknown()), // z.object({ id: z.string(), account_id: z.string() }),
  redirectsPath: z.string(),
  repositoryRoot: z.string(),
})

// export type SerializedCachedConfig = z.output<typeof SerializedCachedConfigSchema>

// Performance optimization when @netlify/config caller has already previously
// called it and cached the result.
// This is used by the buildbot which:
//  - first calls @netlify/config since it needs configuration property
//  - later calls @netlify/build, which runs @netlify/config under the hood
// This is also used by Netlify CLI.
export const getCachedConfig = async function ({
  api,
  cachedConfig,
  cachedConfigPath,
  token,
}: {
  api: NetlifyAPI | undefined
  cachedConfig: unknown
  cachedConfigPath: string | undefined
  token: string | undefined
}): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise<any> {
  const parsedCachedConfig = await parseCachedConfig(cachedConfig, cachedConfigPath)
  // The CLI does not print some properties when they are not serializable or
  // are confidential. Those will be missing from `cachedConfig`. The caller
  // must supply them again when using `cachedConfig`.
  return parsedCachedConfig === undefined ? undefined : { token, ...parsedCachedConfig, api }
}

// `cachedConfig` is a plain object while `cachedConfigPath` is a file path to
// a JSON file. The former is useful in programmatic usage while the second one
// is useful in CLI usage, to avoid hitting the OS limits if the configuration
// file is too big.
const parseCachedConfig = async function (
  cachedConfig: unknown,
  cachedConfigPath: string | undefined,
): Promise<unknown> {
  if (cachedConfig !== undefined) {
    // return cachedConfig
    return SerializedCachedConfigSchema.parse(cachedConfig)
  }

  if (cachedConfigPath !== undefined) {
    // return JSON.parse(await fs.readFile(cachedConfigPath, 'utf8'))
    return SerializedCachedConfigSchema.parse(JSON.parse(await fs.readFile(cachedConfigPath, 'utf8')))
  }
}
