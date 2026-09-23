import * as z from 'zod'

import { bundlers } from '../functions_config.js'
import type { NormalizedNetlifyConfig } from '../types/config.js'
import type { Logs } from '../types/logs.js'
import { parseLeniently } from '../utils/schema.js'

// Types the whole normalized configuration once its rules have passed, so a mismatch is only warned about.

const origin = z.enum(['ui', 'config', 'default', 'inline'])
const plainObject = z.record(z.string(), z.unknown())
const stringOrStrings = z.union([z.string(), z.array(z.string())])

const functionConfigSchema = z.looseObject({
  deno_import_map: z.string().optional(),
  directory: z.string().optional(),
  external_node_modules: z.array(z.string()).optional(),
  ignored_node_modules: z.array(z.string()).optional(),
  included_files: z.array(z.string()).optional(),
  memory: z.union([z.number(), z.string()]).optional(),
  node_bundler: z.enum(bundlers).optional(),
  region: z.string().optional(),
  schedule: z.string().optional(),
  vcpu: z.number().optional(),
})

const normalizedConfigSchema: z.ZodType<NormalizedNetlifyConfig> = z.looseObject({
  build: z.looseObject({
    base: z.string().optional(),
    command: z.string().optional(),
    commandOrigin: origin.optional(),
    edge_functions: z.string().optional(),
    environment: plainObject,
    functions: z.string().optional(),
    ignore: z.string().optional(),
    processing: z.looseObject({
      css: plainObject.exactOptional(),
      html: plainObject.exactOptional(),
      images: plainObject.exactOptional(),
      js: plainObject.exactOptional(),
      skip_processing: z.boolean().exactOptional(),
    }),
    publish: z.string(),
    publishOrigin: origin,
    services: plainObject,
  }),
  functions: z.looseObject({ '*': functionConfigSchema }).catchall(functionConfigSchema),
  plugins: z.array(
    z.looseObject({
      package: z.string(),
      inputs: plainObject,
      pinned_version: z.string().optional(),
      origin: origin.optional(),
    }),
  ),
  database: z.looseObject({ migrations: z.looseObject({ path: z.string().exactOptional() }).optional() }).optional(),
  dev: plainObject.optional(),
  edge_functions: z
    .array(
      z.looseObject({
        function: z.string(),
        path: z.string().optional(),
        excludedPath: stringOrStrings.optional(),
        pattern: z.string().optional(),
        excludedPattern: stringOrStrings.optional(),
        cache: z.enum(['manual', 'off']).optional(),
        method: stringOrStrings.optional(),
        header: z.record(z.string(), z.union([z.string(), z.boolean()])).optional(),
        name: z.string().optional(),
        generator: z.string().optional(),
      }),
    )
    .optional(),
  functionsDirectory: z.string().optional(),
  functionsDirectoryOrigin: z.enum(['ui', 'config', 'config-v1', 'default', 'default-v1']).optional(),
  headersOrigin: origin.optional(),
  images: z.looseObject({ remote_images: z.array(z.string()).exactOptional() }).optional(),
  integrations: z
    .array(
      z.looseObject({
        name: z.string(),
        dev: z.looseObject({ path: z.string(), force_run_in_build: z.boolean().exactOptional() }).exactOptional(),
      }),
    )
    .optional(),
  redirectsOrigin: origin.optional(),
  spa_fallback: z.boolean().optional(),
})

/** The normalized configuration, after its validation rules have passed. */
export const parseNormalizedConfig = (config: unknown, logs: Logs | undefined): NormalizedNetlifyConfig =>
  parseLeniently(normalizedConfigSchema, config, { description: 'configuration', logs })
