import { CronExpressionParser } from 'cron-parser'
import isPlainObj from 'is-plain-obj'
import validateNpmPackageName from 'validate-npm-package-name'
import * as z from 'zod'

import { createEdgeFunctionsSchema, EDGE_FUNCTIONS_PROPERTIES } from '../edge_functions.js'
import { bundlers, WILDCARD_ALL as FUNCTIONS_CONFIG_WILDCARD_ALL } from '../functions_config.js'

import {
  functionsDirectoryCheck,
  isArrayOfObjects,
  isArrayOfStrings,
  isBoolean,
  isString,
  validProperties,
} from './helpers.js'
import { checked, createRules, ruleIssue } from './rule.js'
import type { PathSegment } from './types.js'

// Hand-written checks rather than Zod's own, for clearer error messages. Each stage's rules are
// declared in priority order, and a stage relies on the earlier stages' checks having passed.

const plainObject = z.record(z.string(), z.unknown())

/** A configuration source before any check: a TOML table or a JSON object. */
export const rawConfigSchema = plainObject
export type RawConfig = z.output<typeof rawConfigSchema>
const arrayOfObjects = z.array(plainObject)

const isValidCronExpression = (cron: unknown) => {
  try {
    CronExpressionParser.parse(cron as string)
    return true
  } catch {
    return false
  }
}

// Earlier checks ensure plugin entries are objects.
const plugin = (value: unknown): Partial<Record<'package', unknown>> => (isPlainObj(value) ? value : {})

/** The function name, in examples of `functions.<name>.*`. */
const functionName = (path: PathSegment[]) => String(path[1])

/** Before case normalization. */
const preCaseRule = createRules()
const buildObject = preCaseRule({
  message: 'must be a plain object.',
  example: () => ({ build: { command: 'npm run build' } }),
})

export const PRE_CASE_NORMALIZE_SCHEMA = z.looseObject({
  build: checked(plainObject, [buildObject, isPlainObj]).optional(),
})

/**
 * Only on the user's `netlify.toml`, not on configuration from the UI, the CLI or the Frameworks
 * API. This restricts the properties users may set, excluding those reserved for platform-generated
 * configuration such as `generator`.
 */
const configFileRule = createRules()
const edgeFunctionsUserProperties = validProperties(EDGE_FUNCTIONS_PROPERTIES, [])
const edgeFunctionUserProperties = configFileRule({
  message: edgeFunctionsUserProperties.message,
  example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
})

export const CONFIG_FILE_SCHEMA = z.looseObject({}).check((ctx) => {
  const { edge_functions: edgeFunctions } = ctx.value
  if (!Array.isArray(edgeFunctions) && !isPlainObj(edgeFunctions)) {
    return
  }

  // Entries that aren't objects get a clearer error from the merged configuration's checks, later.
  for (const [key, edgeFunction] of Object.entries(edgeFunctions)) {
    if (isPlainObj(edgeFunction) && !edgeFunctionsUserProperties.check(edgeFunction)) {
      const segment = Array.isArray(edgeFunctions) ? Number(key) : key
      ctx.issues.push(ruleIssue(edgeFunctionUserProperties, edgeFunction, ['edge_functions', segment]))
    }
  }
})

// Properties that get an `origin` are checked twice: before the origin is added, and after
// contexts are merged, since contexts can set them too.
const createOriginShape = function (rule: ReturnType<typeof createRules>) {
  const command = rule({
    message: 'must be a string',
    example: () => ({ build: { command: 'npm run build' } }),
  })
  const plugins = rule({
    message: 'must be an array of objects.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }, { package: 'netlify-plugin-two' }] }),
  })
  return {
    build: z.looseObject({ command: checked(z.string(), [command, isString]).optional() }).optional(),
    plugins: checked(arrayOfObjects, [plugins, isArrayOfObjects]).optional(),
  }
}

/** Before `defaultConfig` is merged. */
export const PRE_MERGE_SCHEMA = z.looseObject(createOriginShape(createRules()))

/** Before contexts are merged. */
const preContextRule = createRules()
const contextObject = preContextRule({
  message: 'must be a plain object.',
  example: () => ({ context: { production: { publish: 'dist' } } }),
})
const contextEntryObject = preContextRule({
  message: 'must be a plain object.',
  example: (_value, key) => ({ context: { [key]: { publish: 'dist' } } }),
})

export const PRE_CONTEXT_SCHEMA = z.looseObject({
  context: checked(z.record(z.string(), checked(plainObject, [contextEntryObject, isPlainObj])), [
    contextObject,
    isPlainObj,
  ]).optional(),
})

/** Before normalization. */
const preNormalizeRule = createRules()
const preNormalizeOriginShape = createOriginShape(preNormalizeRule)
const functionsObject = preNormalizeRule({
  message: 'must be an object.',
  example: () => ({
    functions: { external_node_modules: ['module-one', 'module-two'] },
  }),
})
const edgeFunctionsArray = preNormalizeRule({
  message: 'must be an array of objects.',
  example: () => ({
    edge_functions: [
      { path: '/hello', function: 'hello' },
      { path: '/auth', function: 'auth' },
    ],
  }),
})
const databaseObject = preNormalizeRule({
  message: 'must be a plain object.',
  example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
})
const databaseMigrationsObject = preNormalizeRule({
  message: 'must be a plain object.',
  example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
})

export const PRE_NORMALIZE_SCHEMA = z.looseObject({
  ...preNormalizeOriginShape,
  functions: checked(plainObject, [functionsObject, isPlainObj]).optional(),
  edge_functions: checked(arrayOfObjects, [edgeFunctionsArray, isArrayOfObjects]).optional(),
  database: checked(
    z.looseObject({ migrations: checked(plainObject, [databaseMigrationsObject, isPlainObj]).optional() }),
    [databaseObject, isPlainObj],
  ).optional(),
})

const EXAMPLE_PORT = 80

/** After normalization. */
const postNormalizeRule = createRules()
const pluginProperties = validProperties(['package', 'pinned_version', 'inputs'], ['origin'])
const pluginPropertiesRule = postNormalizeRule({
  message: pluginProperties.message,
  example: { plugins: [{ package: 'netlify-plugin-one', inputs: { port: EXAMPLE_PORT } }] },
})
const pluginPackageRequired = postNormalizeRule({
  message: '"package" property is required.',
  example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
})
const pluginPackageString = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
})
// Neither `package@tag|version` nor `git:...`, `github:...`, `https://...` etc. are allowed, but
// local plugins and scoped packages are.
const pluginPackageName = postNormalizeRule({
  message: 'must be a npm package name only.',
  example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
})
const pluginPinnedVersion = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ plugins: [{ package: 'netlify-plugin-one', pinned_version: '1' }] }),
})
const pluginInputs = postNormalizeRule({
  message: 'must be a plain object.',
  example: () => ({ plugins: [{ package: 'netlify-plugin-one', inputs: { port: EXAMPLE_PORT } }] }),
})
const buildBase = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ build: { base: 'packages/project' } }),
})
const buildPublish = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ build: { publish: 'dist' } }),
})
const buildFunctions = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ build: { functions: 'functions' } }),
})
const buildIgnore = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ build: { ignore: 'ignore' } }),
})
const buildEdgeFunctions = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ build: { edge_functions: 'edge-functions' } }),
})
const spaFallback = postNormalizeRule({
  message: 'must be a boolean.',
  example: () => ({ spa_fallback: true }),
})
const functionObject = postNormalizeRule({
  message: 'must be an object.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { external_node_modules: ['module-one', 'module-two'] } },
  }),
})
const functionDenoImportMap = postNormalizeRule({
  message: 'must be a string.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { deno_import_map: 'path/to/import_map.json' } },
  }),
})
const functionExternalNodeModules = postNormalizeRule({
  message: 'must be an array of strings.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { external_node_modules: ['module-one', 'module-two'] } },
  }),
})
const functionIgnoredNodeModules = postNormalizeRule({
  message: 'must be an array of strings.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { ignored_node_modules: ['module-one', 'module-two'] } },
  }),
})
const functionIncludedFiles = postNormalizeRule({
  message: 'must be an array of strings.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { included_files: ['directory-one/file1', 'directory-two/**/*.jpg'] } },
  }),
})
const functionNodeBundler = postNormalizeRule({
  message: `must be one of: ${bundlers.join(', ')}`,
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { node_bundler: bundlers[0] } },
  }),
})
const functionDirectory = postNormalizeRule({
  message: 'must be defined on the main `functions` object.',
  example: () => ({
    functions: { directory: 'my-functions' },
  }),
})
const functionMemory = postNormalizeRule({
  message: 'must be a number (in MB) or a string with a unit (e.g. "2gb").',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { memory: '2gb' } },
  }),
})
const functionRegion = postNormalizeRule({
  message: 'must be a string.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { region: 'cmh' } },
  }),
})
const functionVcpu = postNormalizeRule({
  message: 'must be a number between 0.5 and 2.',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { vcpu: 1.5 } },
  }),
})
const functionSchedule = postNormalizeRule({
  message: 'must be a valid cron expression (see https://ntl.fyi/cron-syntax).',
  example: (_value, _key, path) => ({
    functions: { [functionName(path)]: { schedule: '5 4 * * *' } },
  }),
})
const functionsDirectory = postNormalizeRule({
  message: 'must be a string.',
  ...functionsDirectoryCheck,
  example: () => ({
    functions: { directory: 'my-functions' },
  }),
})
const databaseMigrationsPath = postNormalizeRule({
  message: 'must be a string.',
  example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
})
const edgeFunctionsSchema = createEdgeFunctionsSchema(postNormalizeRule)

const pluginSchema = checked(
  z.looseObject({
    package: checked(
      z.string(),
      [pluginPackageString, isString],
      [
        pluginPackageName,
        (value) => {
          const packageName = String(value)
          return (
            packageName.startsWith('.') ||
            packageName.startsWith('/') ||
            validateNpmPackageName(packageName).validForOldPackages
          )
        },
      ],
    ),
    pinned_version: checked(z.string(), [pluginPinnedVersion, isString]).optional(),
    inputs: checked(plainObject, [pluginInputs, isPlainObj]).optional(),
  }),
  [pluginPropertiesRule, pluginProperties.check],
  [pluginPackageRequired, (value) => plugin(value).package !== undefined],
)

const functionSchema = checked(
  z.looseObject({
    deno_import_map: checked(z.string(), [functionDenoImportMap, isString]).optional(),
    external_node_modules: checked(z.array(z.string()), [functionExternalNodeModules, isArrayOfStrings]).optional(),
    ignored_node_modules: checked(z.array(z.string()), [functionIgnoredNodeModules, isArrayOfStrings]).optional(),
    included_files: checked(z.array(z.string()), [functionIncludedFiles, isArrayOfStrings]).optional(),
    node_bundler: checked(z.enum(bundlers), [
      functionNodeBundler,
      (value) => bundlers.includes(value as (typeof bundlers)[number]),
    ]).optional(),
    // The check also accepts `NaN` and `Infinity`, which `z.number()` rejects.
    memory: checked(z.custom<number | string>(), [
      functionMemory,
      (value) => typeof value === 'number' || isString(value),
    ]).optional(),
    region: checked(z.string(), [functionRegion, isString]).optional(),
    vcpu: checked(z.number(), [
      functionVcpu,
      (value) => typeof value === 'number' && value >= 0.5 && value <= 2,
    ]).optional(),
    // The cron parser also accepts falsy values, such as `false`, as no expression, and arrays of
    // predefined names, such as `["@daily"]`.
    schedule: checked(z.unknown(), [functionSchedule, isValidCronExpression]).optional(),
  }),
  [functionObject, isPlainObj],
)

// `functions.*.directory` is only valid on `*`, and that one is moved to `functionsDirectory` during
// normalization, so this needs each function's name.
const functionsSchema = z.record(z.string(), functionSchema).check((ctx) => {
  for (const [name, functionConfig] of Object.entries(ctx.value)) {
    if (
      isPlainObj(functionConfig) &&
      functionConfig['directory'] !== undefined &&
      name !== FUNCTIONS_CONFIG_WILDCARD_ALL
    ) {
      ctx.issues.push(ruleIssue(functionDirectory, functionConfig['directory'], [name, 'directory']))
    }
  }
})

export const POST_NORMALIZE_SCHEMA = z.looseObject({
  plugins: z.array(pluginSchema).optional(),
  build: z
    .looseObject({
      base: checked(z.string(), [buildBase, isString]).optional(),
      publish: checked(z.string(), [buildPublish, isString]).optional(),
      functions: checked(z.string(), [buildFunctions, isString]).optional(),
      ignore: checked(z.string(), [buildIgnore, isString]).optional(),
      edge_functions: checked(z.string(), [buildEdgeFunctions, isString]).optional(),
    })
    .optional(),
  spa_fallback: checked(z.boolean(), [spaFallback, isBoolean]).optional(),
  functions: functionsSchema.optional(),
  functionsDirectory: checked(z.string(), [functionsDirectory, isString]).optional(),
  database: z
    .looseObject({
      migrations: z
        .looseObject({ path: checked(z.string(), [databaseMigrationsPath, isString]).optional() })
        .optional(),
    })
    .optional(),
  edge_functions: edgeFunctionsSchema.optional(),
})

export type CaseCheckedConfig = z.output<typeof PRE_CASE_NORMALIZE_SCHEMA>
export type SourceCheckedConfig = z.output<typeof PRE_MERGE_SCHEMA>
export type ContextCheckedConfig = z.output<typeof PRE_CONTEXT_SCHEMA>
export type MergeCheckedConfig = z.output<typeof PRE_NORMALIZE_SCHEMA>
