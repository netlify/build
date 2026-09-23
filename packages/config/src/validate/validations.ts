import { CronExpressionParser } from 'cron-parser'
import validateNpmPackageName from 'validate-npm-package-name'

import { validations as edgeFunctionValidations, EDGE_FUNCTIONS_PROPERTIES } from '../edge_functions.js'
import { bundlers, WILDCARD_ALL as FUNCTIONS_CONFIG_WILDCARD_ALL } from '../functions_config.js'
import { isPlainObj } from '../utils/is_plain_obj.js'

import {
  functionsDirectoryCheck,
  isArrayOfObjects,
  isArrayOfStrings,
  isBoolean,
  isString,
  validProperties,
} from './helpers.js'
import type { PathSegment, Validation } from './types.js'

// Hand-written validations rather than a JSON schema, for clearer error messages.

const isValidCronExpression = (cron: unknown) => {
  try {
    CronExpressionParser.parse(cron as string)
    return true
  } catch {
    return false
  }
}

const FUNCTION_MEMORY_PATTERN = /^(\d+(?:\.\d+)?)\s*(mb|gb)?$/i
const FUNCTION_MEMORY_MIN_MB = 1024
const FUNCTION_MEMORY_MAX_MB = 4096

const parseMegabytes = (value: string) => {
  const match = FUNCTION_MEMORY_PATTERN.exec(value.trim())

  if (match === null) {
    return Number.NaN
  }

  const [, amount = '', unit = ''] = match
  return Number.parseFloat(amount) * (unit.toLowerCase() === 'gb' ? 1024 : 1)
}

const isValidFunctionMemory = (value: unknown) => {
  const megabytes = isString(value) ? parseMegabytes(value) : value

  return (
    typeof megabytes === 'number' &&
    Number.isInteger(megabytes) &&
    megabytes >= FUNCTION_MEMORY_MIN_MB &&
    megabytes <= FUNCTION_MEMORY_MAX_MB
  )
}

const SERVER_PROPERTIES = ['excludedPath', 'includedFiles', 'path', 'region', 'scale', 'size']
const SERVER_REGIONS = ['cmh', 'fra']
const SERVER_SIZES = ['small', 'medium', 'large']
const SERVER_SCALE_PROPERTIES = ['min', 'max']

const isIntegerFrom = (min: number) => (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= min

const isServerPath = (value: unknown) => isString(value) && value.startsWith('/')
const isServerPaths = (value: unknown) => isServerPath(value) || (Array.isArray(value) && value.every(isServerPath))

const isServerScaleOrdered = (value: unknown) => {
  if (!isPlainObj(value)) {
    return true
  }

  const { min, max } = value
  return typeof min !== 'number' || typeof max !== 'number' || min <= max
}

// Earlier validations ensure plugin entries are objects.
const plugin = (value: unknown): Partial<Record<'package', unknown>> => (isPlainObj(value) ? value : {})

/** The function name, in examples of `functions.<name>.*`. */
const functionName = (path: PathSegment[]) => String(path[1])

/** Before case normalization. */
export const PRE_CASE_NORMALIZE_VALIDATIONS: Validation[] = [
  {
    property: 'build',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ build: { command: 'npm run build' } }),
  },
]

const edgeFunctionsUserProperties = validProperties(EDGE_FUNCTIONS_PROPERTIES, [])

/**
 * Only on the user's `netlify.toml`, not on configuration from the UI, the CLI or the Frameworks
 * API. This restricts the properties users may set, excluding those reserved for platform-generated
 * configuration such as `generator`.
 */
export const CONFIG_FILE_VALIDATIONS: Validation[] = [
  {
    property: 'edge_functions.*',
    ...edgeFunctionsUserProperties,
    // Entries that aren't objects are reported by the shared `edge_functions` validations, which run
    // later and give a clearer error.
    check: (edgeFunction, key, path) =>
      !isPlainObj(edgeFunction) || edgeFunctionsUserProperties.check(edgeFunction, key, path),
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
]

// Properties that get an `origin` are validated twice: before the origin is added, and after
// contexts are merged, since contexts can set them too.
const ORIGIN_VALIDATIONS: Validation[] = [
  {
    property: 'build.command',
    check: isString,
    message: 'must be a string',
    example: () => ({ build: { command: 'npm run build' } }),
  },
  {
    property: 'plugins',
    check: isArrayOfObjects,
    message: 'must be an array of objects.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }, { package: 'netlify-plugin-two' }] }),
  },
]

/** Before `defaultConfig` is merged. */
export const PRE_MERGE_VALIDATIONS: Validation[] = [...ORIGIN_VALIDATIONS]

/** Before contexts are merged. */
export const PRE_CONTEXT_VALIDATIONS: Validation[] = [
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
    example: (_value, key) => ({ context: { [key]: { publish: 'dist' } } }),
  },
]

/** Before normalization. */
export const PRE_NORMALIZE_VALIDATIONS: Validation[] = [
  ...ORIGIN_VALIDATIONS,
  {
    property: 'functions',
    check: isPlainObj,
    message: 'must be an object.',
    example: () => ({
      functions: { external_node_modules: ['module-one', 'module-two'] },
    }),
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
  {
    property: 'database',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
  },
  {
    property: 'database.migrations',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
  },
  {
    property: 'server',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ server: { path: '/api/*', size: 'small' } }),
  },
]

const EXAMPLE_PORT = 80

/** After normalization. */
export const POST_NORMALIZE_VALIDATIONS: Validation[] = [
  {
    property: 'plugins.*',
    ...validProperties(['package', 'pinned_version', 'inputs'], ['origin']),
    example: { plugins: [{ package: 'netlify-plugin-one', inputs: { port: EXAMPLE_PORT } }] },
  },
  {
    property: 'plugins.*',
    check: (value) => plugin(value).package !== undefined,
    message: '"package" property is required.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },
  {
    property: 'plugins.*.package',
    check: isString,
    message: 'must be a string.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },
  // Neither `package@tag|version` nor `git:...`, `github:...`, `https://...` etc. are allowed, but
  // local plugins and scoped packages are.
  {
    property: 'plugins.*.package',
    // An earlier validation ensures this is a string.
    check: (value) => {
      const packageName = String(value)
      return (
        packageName.startsWith('.') ||
        packageName.startsWith('/') ||
        validateNpmPackageName(packageName).validForOldPackages
      )
    },
    message: 'must be a npm package name only.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
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
    example: () => ({ plugins: [{ package: 'netlify-plugin-one', inputs: { port: EXAMPLE_PORT } }] }),
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
    property: 'build.functions',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { functions: 'functions' } }),
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
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { external_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.deno_import_map',
    check: isString,
    message: 'must be a string.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { deno_import_map: 'path/to/import_map.json' } },
    }),
  },
  {
    property: 'functions.*.external_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { external_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.ignored_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { ignored_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.included_files',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { included_files: ['directory-one/file1', 'directory-two/**/*.jpg'] } },
    }),
  },
  {
    property: 'functions.*.node_bundler',
    check: (value) => bundlers.includes(value as (typeof bundlers)[number]),
    message: `must be one of: ${bundlers.join(', ')}`,
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { node_bundler: bundlers[0] } },
    }),
  },
  {
    property: 'functions.*.directory',
    check: (_value, _key, path) => functionName(path) === FUNCTIONS_CONFIG_WILDCARD_ALL,
    message: 'must be defined on the main `functions` object.',
    example: () => ({
      functions: { directory: 'my-functions' },
    }),
  },
  {
    property: 'functions.*.memory',
    check: isValidFunctionMemory,
    message: 'must be between 1024 and 4096 MB, as a number (in MB) or a string with a unit (e.g. "2gb").',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { memory: '2gb' } },
    }),
  },
  {
    property: 'functions.*.region',
    check: isString,
    message: 'must be a string.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { region: 'cmh' } },
    }),
  },
  {
    property: 'functions.*.vcpu',
    check: (value) => typeof value === 'number' && value >= 0.5 && value <= 2,
    message: 'must be a number between 0.5 and 2.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { vcpu: 1.5 } },
    }),
  },
  {
    property: 'functions.*',
    check: (functionConfig) =>
      !(isPlainObj(functionConfig) && functionConfig['memory'] !== undefined && functionConfig['vcpu'] !== undefined),
    message: '"memory" and "vcpu" are mutually exclusive.',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { memory: '2gb' } },
    }),
  },
  {
    property: 'functions.*.schedule',
    check: isValidCronExpression,
    message: 'must be a valid cron expression (see https://ntl.fyi/cron-syntax).',
    example: (_value, _key, path) => ({
      functions: { [functionName(path)]: { schedule: '5 4 * * *' } },
    }),
  },
  {
    property: 'functionsDirectory',
    check: isString,
    message: 'must be a string.',
    ...functionsDirectoryCheck,
    example: () => ({
      functions: { directory: 'my-functions' },
    }),
  },
  {
    property: 'database.migrations.path',
    check: isString,
    message: 'must be a string.',
    example: () => ({ database: { migrations: { path: 'netlify/database/migrations' } } }),
  },
  {
    property: 'server',
    ...validProperties(SERVER_PROPERTIES, []),
    example: () => ({ server: { path: '/api/*', size: 'small' } }),
  },
  {
    property: 'server.path',
    check: isServerPaths,
    message: 'must be a path starting with "/", or an array of them.',
    example: () => ({ server: { path: ['/api/*', '/auth/callback'] } }),
  },
  {
    property: 'server.excludedPath',
    check: isServerPaths,
    message: 'must be a path starting with "/", or an array of them.',
    example: () => ({ server: { path: '/api/*', excludedPath: ['/api/internal', '/api/admin/*'] } }),
  },
  {
    property: 'server.includedFiles',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: () => ({ server: { includedFiles: ['data/**', 'templates/*.html'] } }),
  },
  // Region and size are lowercased during normalization.
  {
    property: 'server.region',
    check: (value) => isString(value) && SERVER_REGIONS.includes(value),
    message: `must be one of: ${SERVER_REGIONS.join(', ')}`,
    example: () => ({ server: { region: SERVER_REGIONS[0] } }),
  },
  {
    property: 'server.size',
    check: (value) => isString(value) && SERVER_SIZES.includes(value),
    message: `must be one of: ${SERVER_SIZES.join(', ')}`,
    example: () => ({ server: { size: SERVER_SIZES[0] } }),
  },
  {
    property: 'server.scale',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ server: { scale: { min: 0, max: 3 } } }),
  },
  {
    property: 'server.scale',
    ...validProperties(SERVER_SCALE_PROPERTIES, []),
    example: () => ({ server: { scale: { min: 0, max: 3 } } }),
  },
  {
    property: 'server.scale.min',
    check: isIntegerFrom(0),
    message: 'must be an integer greater than or equal to 0.',
    example: () => ({ server: { scale: { min: 0 } } }),
  },
  {
    property: 'server.scale.max',
    check: isIntegerFrom(1),
    message: 'must be an integer greater than or equal to 1.',
    example: () => ({ server: { scale: { max: 3 } } }),
  },
  {
    property: 'server.scale',
    check: isServerScaleOrdered,
    message: 'must have a "min" less than or equal to its "max".',
    example: () => ({ server: { scale: { min: 0, max: 3 } } }),
  },
  ...edgeFunctionValidations,
]
