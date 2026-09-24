import { CronExpressionParser } from 'cron-parser'
import isPlainObj from 'is-plain-obj'
import validateNpmPackageName from 'validate-npm-package-name'
import * as z from 'zod'

import type {
  ConfigOrigin,
  FunctionsDirectoryOrigin,
  Logs,
  NodeBundler,
  NormalizedConfig,
  PluginConfig,
  RawConfig,
  SourceEntry,
} from '../types.js'

import {
  checkObject,
  hasOnlyProperties,
  isArrayOfObjects,
  isArrayOfStrings,
  isBoolean,
  isOneOf,
  isString,
  unknownPropertiesMessage,
} from './common_rules.js'
import { EDGE_FUNCTION_RULES, EDGE_FUNCTION_USER_PROPERTIES_RULE } from './edge_function_rules.js'
import { type PathSegment, type Rule, validate } from './engine.js'
import { parseLeniently } from './lenient.js'

// One ordered list of rules per validation stage of SPEC §10.1, in the order of SPEC §10.3.

const PLUGIN_PROPERTIES = ['package', 'pinned_version', 'inputs'] as const satisfies readonly (keyof PluginConfig)[]
// Allowed, but not listed in the error message.
const LEGACY_PLUGIN_PROPERTIES = ['origin'] as const satisfies readonly (keyof PluginConfig)[]

const NODE_BUNDLERS = ['esbuild', 'nft', 'zisi', 'none'] as const satisfies readonly NodeBundler[]

const isCronExpression = (value: unknown): boolean => {
  try {
    // The parser takes any value: it accepts falsy ones, and arrays of predefined names such as `["@daily"]`.
    CronExpressionParser.parse(value as string)
    return true
  } catch {
    return false
  }
}

// Local plugins are paths. Others may not include a version or a URI scheme, but may have a scope.
const isPackageName = (value: unknown): boolean =>
  isString(value) &&
  (value.startsWith('.') || value.startsWith('/') || validateNpmPackageName(value).validForOldPackages)

/** An example for `functions.<name>.*`, where `<name>` is `*` for top-level `[functions]` properties. */
const functionExample = (path: PathSegment[], functionConfig: Record<string, unknown>) => ({
  functions: { [String(path[1])]: functionConfig },
})

const buildExample = () => ({ build: { command: 'npm run build' } })
const pluginExample = () => ({ plugins: [{ package: 'netlify-plugin-one' }] })
const pluginInputsExample = () => ({ plugins: [{ package: 'netlify-plugin-one', inputs: { port: 80 } }] })
const databaseExample = () => ({ database: { migrations: { path: 'netlify/database/migrations' } } })
const functionsDirectoryExample = () => ({ functions: { directory: 'my-functions' } })

const BEFORE_CASE_NORMALIZATION_RULES: readonly Rule[] = [
  { property: 'build', check: isPlainObj, message: 'must be a plain object.', example: buildExample },
]

const SOURCE_RULES: readonly Rule[] = [
  { property: 'build.command', check: isString, message: 'must be a string', example: buildExample },
  {
    property: 'plugins',
    check: isArrayOfObjects,
    message: 'must be an array of objects.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }, { package: 'netlify-plugin-two' }] }),
  },
]

const CONFIG_FILE_RULES: readonly Rule[] = [EDGE_FUNCTION_USER_PROPERTIES_RULE]

const CONTEXT_RULES: readonly Rule[] = [
  {
    property: 'context',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ context: { production: { publish: 'dist' } } }),
  },
  {
    property: 'context.*',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: (path) => ({ context: { [String(path.at(-1))]: { publish: 'dist' } } }),
  },
]

// `build.command` and `plugins` are not checked again: every source and context entry was, and
// merging keeps them valid.
const MERGED_RULES: readonly Rule[] = [
  {
    property: 'functions',
    check: isPlainObj,
    message: 'must be an object.',
    example: () => ({ functions: { external_node_modules: ['module-one', 'module-two'] } }),
  },
  {
    property: 'edge_functions',
    check: isArrayOfObjects,
    message: 'must be an array of objects.',
    example: () => ({
      edge_functions: [
        { path: '/hello', function: 'hello' },
        { path: '/auth', function: 'auth' },
      ],
    }),
  },
  { property: 'database', check: isPlainObj, message: 'must be a plain object.', example: databaseExample },
  { property: 'database.migrations', check: isPlainObj, message: 'must be a plain object.', example: databaseExample },
]

// `build.functions` is not checked: normalization always moves it to `functionsDirectory`.
const NORMALIZED_RULES: readonly Rule[] = [
  {
    property: 'plugins.*',
    check: checkObject((plugin) => hasOnlyProperties(plugin, [...PLUGIN_PROPERTIES, ...LEGACY_PLUGIN_PROPERTIES])),
    message: unknownPropertiesMessage(PLUGIN_PROPERTIES),
    example: pluginInputsExample,
  },
  {
    property: 'plugins.*',
    check: checkObject((plugin) => plugin['package'] !== undefined),
    message: '"package" property is required.',
    example: pluginExample,
  },
  { property: 'plugins.*.package', check: isString, message: 'must be a string.', example: pluginExample },
  {
    property: 'plugins.*.package',
    check: isPackageName,
    message: 'must be a npm package name only.',
    example: pluginExample,
  },
  {
    property: 'plugins.*.pinned_version',
    check: isString,
    message: 'must be a string.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one', pinned_version: '1' }] }),
  },
  {
    property: 'plugins.*.inputs',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: pluginInputsExample,
  },
  {
    property: 'build.base',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { base: 'packages/project' } }),
  },
  {
    property: 'build.publish',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { publish: 'dist' } }),
  },
  {
    property: 'build.ignore',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { ignore: 'ignore' } }),
  },
  {
    property: 'build.edge_functions',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { edge_functions: 'edge-functions' } }),
  },
  {
    property: 'spa_fallback',
    check: isBoolean,
    message: 'must be a boolean.',
    example: () => ({ spa_fallback: true }),
  },
  {
    property: 'functions.*',
    check: isPlainObj,
    message: 'must be an object.',
    example: (path) => functionExample(path, { external_node_modules: ['module-one', 'module-two'] }),
  },
  {
    property: 'functions.*.deno_import_map',
    check: isString,
    message: 'must be a string.',
    example: (path) => functionExample(path, { deno_import_map: 'path/to/import_map.json' }),
  },
  {
    property: 'functions.*.external_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (path) => functionExample(path, { external_node_modules: ['module-one', 'module-two'] }),
  },
  {
    property: 'functions.*.ignored_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (path) => functionExample(path, { ignored_node_modules: ['module-one', 'module-two'] }),
  },
  {
    property: 'functions.*.included_files',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (path) => functionExample(path, { included_files: ['directory-one/file1', 'directory-two/**/*.jpg'] }),
  },
  {
    property: 'functions.*.node_bundler',
    check: (value) => isOneOf(NODE_BUNDLERS, value),
    message: `must be one of: ${NODE_BUNDLERS.join(', ')}`,
    example: (path) => functionExample(path, { node_bundler: NODE_BUNDLERS[0] }),
  },
  // Normalization moves `functions['*'].directory` to `functionsDirectory`, so any `directory` left is misplaced.
  {
    property: 'functions.*.directory',
    check: () => false,
    message: 'must be defined on the main `functions` object.',
    example: functionsDirectoryExample,
  },
  {
    property: 'functions.*.memory',
    check: (value) => typeof value === 'number' || isString(value),
    message: 'must be a number (in MB) or a string with a unit (e.g. "2gb").',
    example: (path) => functionExample(path, { memory: '2gb' }),
  },
  {
    property: 'functions.*.region',
    check: isString,
    message: 'must be a string.',
    example: (path) => functionExample(path, { region: 'cmh' }),
  },
  {
    property: 'functions.*.vcpu',
    check: (value) => typeof value === 'number' && value >= 0.5 && value <= 2,
    message: 'must be a number between 0.5 and 2.',
    example: (path) => functionExample(path, { vcpu: 1.5 }),
  },
  {
    property: 'functions.*.schedule',
    check: isCronExpression,
    message: 'must be a valid cron expression (see https://ntl.fyi/cron-syntax).',
    example: (path) => functionExample(path, { schedule: '5 4 * * *' }),
  },
  // Users set it as `functions.directory`, which normalization moves here.
  {
    property: 'functionsDirectory',
    check: isString,
    message: 'must be a string.',
    example: functionsDirectoryExample,
    propertyName: 'functions.directory',
    formatInvalid: (invalid) => ({
      functions: { directory: isPlainObj(invalid) ? invalid['functionsDirectory'] : undefined },
    }),
  },
  {
    property: 'database.migrations.path',
    check: isString,
    message: 'must be a string.',
    example: databaseExample,
  },
  ...EDGE_FUNCTION_RULES,
]

/** Stage PC: before case normalization. */
export const checkBeforeCaseNormalization = function (config: RawConfig): void {
  validate(config, BEFORE_CASE_NORMALIZATION_RULES)
}

/** Stage PM: before merging. */
export const checkSource = function (config: RawConfig): SourceEntry {
  validate(config, SOURCE_RULES)
  // The rules checked `build.command` and `plugins`, and case normalization made `build` an object.
  return config as SourceEntry
}

/** Stage CF: properties users may not set in `netlify.toml`. */
export const checkConfigFile = function (config: RawConfig): void {
  validate(config, CONFIG_FILE_RULES)
}

/** Stage PX. */
export const checkContexts = function (config: SourceEntry): Record<string, RawConfig> | undefined {
  validate(config, CONTEXT_RULES)
  // The rules checked that `context` and its entries are plain objects.
  return config.context as Record<string, RawConfig> | undefined
}

/** Stage PN: the merged configuration, before normalization. */
export const checkMerged = function (config: SourceEntry): void {
  validate(config, MERGED_RULES)
}

/** Stage N: after normalization. */
export const checkNormalized = function (config: RawConfig): void {
  validate(config, NORMALIZED_RULES)
}

const origin = z.enum(['ui', 'config', 'default', 'inline'] as const satisfies readonly ConfigOrigin[])
const record = z.record(z.string(), z.unknown())
const stringOrStrings = z.union([z.string(), z.array(z.string())])

const functionConfigSchema = z.looseObject({
  deno_import_map: z.string().optional(),
  directory: z.string().optional(),
  external_node_modules: z.array(z.string()).optional(),
  ignored_node_modules: z.array(z.string()).optional(),
  included_files: z.array(z.string()).optional(),
  memory: z.union([z.number(), z.string()]).optional(),
  node_bundler: z.enum(NODE_BUNDLERS).optional(),
  region: z.string().optional(),
  schedule: z.unknown().optional(),
  vcpu: z.number().optional(),
})

const edgeFunctionSchema = z.looseObject({
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
})

// Mirrors `NormalizedConfig`.
const normalizedConfigSchema: z.ZodType<NormalizedConfig> = z.looseObject({
  build: z.looseObject({
    base: z.string().optional(),
    command: z.string().optional(),
    commandOrigin: origin.optional(),
    edge_functions: z.string().optional(),
    environment: record,
    functions: z.string().optional(),
    ignore: z.string().optional(),
    processing: z.looseObject({
      css: record,
      html: record,
      images: record,
      js: record,
      skip_processing: z.boolean().optional(),
    }),
    publish: z.string(),
    publishOrigin: origin,
    services: record,
  }),
  functions: z.looseObject({ '*': functionConfigSchema }).catchall(functionConfigSchema),
  functionsDirectory: z.string().optional(),
  functionsDirectoryOrigin: z
    .enum(['ui', 'config', 'config-v1', 'default', 'default-v1'] as const satisfies readonly FunctionsDirectoryOrigin[])
    .optional(),
  plugins: z.array(
    z.looseObject({
      package: z.string(),
      inputs: record,
      pinned_version: z.string().optional(),
      origin: origin.optional(),
    }),
  ),
  edge_functions: z.array(edgeFunctionSchema).optional(),
  database: z.looseObject({ migrations: z.looseObject({ path: z.string().optional() }).optional() }).optional(),
  dev: record.optional(),
  images: z.looseObject({ remote_images: z.array(z.string()).optional() }).optional(),
  integrations: z
    .array(
      z.looseObject({
        name: z.string(),
        dev: z.looseObject({ path: z.string(), force_run_in_build: z.boolean().optional() }).optional(),
      }),
    )
    .optional(),
  spa_fallback: z.boolean().optional(),
  headersOrigin: origin.optional(),
  redirectsOrigin: origin.optional(),
  headers: z.unknown().optional(),
  redirects: z.unknown().optional(),
})

/** Only warns on a mismatch, since the rules don't check every property. */
export const warnUnexpectedConfig = function (config: RawConfig, logs: Logs | undefined): NormalizedConfig {
  return parseLeniently(normalizedConfigSchema, config, { description: 'configuration', logs })
}
