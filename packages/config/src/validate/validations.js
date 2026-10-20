import { CronExpressionParser } from 'cron-parser'
import isPlainObj from 'is-plain-obj'
import validateNpmPackageName from 'validate-npm-package-name'

import { validations as edgeFunctionValidations, EDGE_FUNCTIONS_PROPERTIES } from '../edge_functions.js'
import { bundlers, WILDCARD_ALL as FUNCTIONS_CONFIG_WILDCARD_ALL } from '../functions_config.js'

import {
  functionsDirectoryCheck,
  isArrayOfObjects,
  isArrayOfStrings,
  isBoolean,
  isString,
  validProperties,
} from './helpers.js'

/**
 * @param {string} cron
 * @returns {boolean}
 */
const isValidCronExpression = (cron) => {
  try {
    CronExpressionParser.parse(cron)
    return true
  } catch {
    return false
  }
}

const FUNCTION_MEMORY_PATTERN = /^(\d+(?:\.\d+)?)\s*(mb|gb)?$/i
const FUNCTION_MEMORY_MIN_MB = 1024
const FUNCTION_MEMORY_MAX_MB = 4096

const isValidFunctionMemory = (value) => {
  let megabytes = value

  if (isString(value)) {
    const match = FUNCTION_MEMORY_PATTERN.exec(value.trim())

    if (!match) {
      return false
    }

    megabytes = Number.parseFloat(match[1]) * (match[2]?.toLowerCase() === 'gb' ? 1024 : 1)
  }

  return Number.isInteger(megabytes) && megabytes >= FUNCTION_MEMORY_MIN_MB && megabytes <= FUNCTION_MEMORY_MAX_MB
}

const SERVER_PROPERTIES = ['excludedPath', 'path', 'region', 'size']
const SERVER_REGIONS = ['cmh', 'fra']
const SERVER_SIZES = ['small', 'medium', 'large']

const isServerPath = (value) => isString(value) && value.startsWith('/')
const isServerPaths = (value) => isServerPath(value) || (Array.isArray(value) && value.every(isServerPath))

// List of validations performed on the configuration file.
// Validation are performed in order: parent should be before children.
// Each validation is an object with the following properties:
//   - `property` {string}: dot-delimited path to the property.
//     Can contain `*` providing a previous check validates the parent is an
//     object or an array.
//   - `propertyName` {string}: human-friendly property name; overrides the
//     value of `property` when displaying an error message
//   - `check` {(value, key, prevPath) => boolean}: validation check function
//   - `message` {string}: error message
//   - `example` {string}: example of correct code
//   - `formatInvalid` {(object) => object}: formats the invalid value when
//     displaying an error message
// We use this instead of JSON schema (or others) to get nicer error messages.

// Validations done before case normalization
export const PRE_CASE_NORMALIZE_VALIDATIONS = [
  {
    property: 'build',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ build: { command: 'npm run build' } }),
  },
]

const edgeFunctionsUserProperties = validProperties(EDGE_FUNCTIONS_PROPERTIES, [])

// Validations performed only on the user's configuration file (`netlify.toml`),
// i.e. not on configuration coming from other origins such as the UI, the CLI,
// or the Frameworks API. This is where the schema is restricted to the subset
// of properties that users are allowed to set, excluding those reserved for
// platform-generated configuration (e.g. `generator`).
export const CONFIG_FILE_VALIDATIONS = [
  {
    property: 'edge_functions.*',
    ...edgeFunctionsUserProperties,
    // Structural problems, such as an entry that is not an object, are reported
    // by the shared `edge_functions` validations, which run later. We only check
    // the properties of actual objects here, so that those validations remain
    // the ones surfacing a meaningful error.
    check: (edgeFunction) => !isPlainObj(edgeFunction) || edgeFunctionsUserProperties.check(edgeFunction),
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
]

// Properties with an `origin` property need to be validated twice:
//  - Before the `origin` property is added
//  - After `context.*` is merged, since they might contain that property
const ORIGIN_VALIDATIONS = [
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

// Validations done before `defaultConfig` merge
export const PRE_MERGE_VALIDATIONS = [...ORIGIN_VALIDATIONS]

// Validations done before context merge
export const PRE_CONTEXT_VALIDATIONS = [
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
    example: (contextProps, key) => ({ context: { [key]: { publish: 'dist' } } }),
  },
]

// Validations done before normalization
export const PRE_NORMALIZE_VALIDATIONS = [
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
    property: 'functions',
    check: isPlainObj,
    message: 'must be an object.',
    example: () => ({
      functions: { ignored_node_modules: ['module-one', 'module-two'] },
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

// Validations done after normalization
export const POST_NORMALIZE_VALIDATIONS = [
  {
    property: 'plugins.*',
    ...validProperties(['package', 'pinned_version', 'inputs'], ['origin']),
    example: { plugins: [{ package: 'netlify-plugin-one', inputs: { port: EXAMPLE_PORT } }] },
  },

  {
    property: 'plugins.*',
    check: (plugin) => plugin.package !== undefined,
    message: '"package" property is required.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },

  {
    property: 'plugins.*.package',
    check: isString,
    message: 'must be a string.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },
  // We don't allow `package@tag|version` nor `git:...`, `github:...`,
  // `https://...`, etc.
  // We skip this validation for local plugins.
  // We ensure @scope/plugin still work.
  {
    property: 'plugins.*.package',
    check: (packageName) =>
      packageName.startsWith('.') ||
      packageName.startsWith('/') ||
      validateNpmPackageName(packageName).validForOldPackages,
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
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { external_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.deno_import_map',
    check: isString,
    message: 'must be a string.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { deno_import_map: 'path/to/import_map.json' } },
    }),
  },
  {
    property: 'functions.*.external_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { external_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.ignored_node_modules',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { ignored_node_modules: ['module-one', 'module-two'] } },
    }),
  },
  {
    property: 'functions.*.included_files',
    check: isArrayOfStrings,
    message: 'must be an array of strings.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { included_files: ['directory-one/file1', 'directory-two/**/*.jpg'] } },
    }),
  },
  {
    property: 'functions.*.node_bundler',
    check: (value) => bundlers.includes(value),
    message: `must be one of: ${bundlers.join(', ')}`,
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { node_bundler: bundlers[0] } },
    }),
  },
  {
    property: 'functions.*.directory',
    check: (value, key, prevPath) => prevPath[1] === FUNCTIONS_CONFIG_WILDCARD_ALL,
    message: 'must be defined on the main `functions` object.',
    example: () => ({
      functions: { directory: 'my-functions' },
    }),
  },
  {
    property: 'functions.*.memory',
    check: isValidFunctionMemory,
    message: 'must be between 1024 and 4096 MB, as a number (in MB) or a string with a unit (e.g. "2gb").',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { memory: '2gb' } },
    }),
  },
  {
    property: 'functions.*.region',
    check: isString,
    message: 'must be a string.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { region: 'cmh' } },
    }),
  },
  {
    property: 'functions.*.vcpu',
    check: (value) => typeof value === 'number' && value >= 0.5 && value <= 2,
    message: 'must be a number between 0.5 and 2.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { vcpu: 1.5 } },
    }),
  },
  {
    property: 'functions.*',
    check: (functionConfig) => !(functionConfig.memory !== undefined && functionConfig.vcpu !== undefined),
    message: '"memory" and "vcpu" are mutually exclusive.',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { memory: '2gb' } },
    }),
  },
  {
    property: 'functions.*.schedule',
    check: isValidCronExpression,
    message: 'must be a valid cron expression (see https://ntl.fyi/cron-syntax).',
    example: (value, key, prevPath) => ({
      functions: { [prevPath[1]]: { schedule: '5 4 * * *' } },
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
  // Region and size are lowercased during normalization.
  {
    property: 'server.region',
    check: (value) => SERVER_REGIONS.includes(value),
    message: `must be one of: ${SERVER_REGIONS.join(', ')}`,
    example: () => ({ server: { region: SERVER_REGIONS[0] } }),
  },
  {
    property: 'server.size',
    check: (value) => SERVER_SIZES.includes(value),
    message: `must be one of: ${SERVER_SIZES.join(', ')}`,
    example: () => ({ server: { size: SERVER_SIZES[0] } }),
  },
  ...edgeFunctionValidations,
]
