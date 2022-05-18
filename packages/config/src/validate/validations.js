/* eslint-disable max-lines */

import CronParser from 'cron-parser'
import isPlainObj from 'is-plain-obj'
import validateNpmPackageName from 'validate-npm-package-name'

import { bundlers, WILDCARD_ALL as FUNCTIONS_CONFIG_WILDCARD_ALL } from '../functions_config.js'

import { functionsDirectoryCheck, isArrayOfObjects, isArrayOfStrings, isString, validProperties } from './helpers.js'

/**
 * @param {string} cron
 * @returns {boolean}
 */
const isValidCronExpression = (cron) => {
  try {
    CronParser.parseExpression(cron)
    return true
  } catch {
    return false
  }
}

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
    property: 'build.edge_functions',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { edge_functions: 'edge-functions' } }),
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
    property: 'edge_functions.*',
    ...validProperties(['path', 'function'], []),
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (edgeFunction) => edgeFunction.path !== undefined,
    message: '"path" property is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (edgeFunction) => edgeFunction.function !== undefined,
    message: '"function" property is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.path',
    check: isString,
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.function',
    check: isString,
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.path',
    check: (pathName) => pathName.startsWith('/'),
    message: 'must be a valid path.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
]
/* eslint-enable max-lines */
