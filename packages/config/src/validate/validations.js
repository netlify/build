/* eslint-disable max-lines */
'use strict'

const isPlainObj = require('is-plain-obj')
const validateNpmPackageName = require('validate-npm-package-name')

const { bundlers, WILDCARD_ALL: FUNCTIONS_CONFIG_WILDCARD_ALL } = require('../functions_config')

const {
  functionsDirectoryCheck,
  isArrayOfObjects,
  isArrayOfStrings,
  isString,
  validProperties,
  insideRootCheck,
  removeParentDots,
} = require('./helpers')

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
const PRE_CASE_NORMALIZE_VALIDATIONS = [
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
const PRE_MERGE_VALIDATIONS = [...ORIGIN_VALIDATIONS]

// Validations done before context merge
const PRE_CONTEXT_VALIDATIONS = [
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
const PRE_NORMALIZE_VALIDATIONS = [
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
]

const EXAMPLE_PORT = 80

// Validations done after normalization
const POST_NORMALIZE_VALIDATIONS = [
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
    property: 'build.base',
    ...insideRootCheck,
    example: (base) => ({ build: { base: removeParentDots(base) } }),
  },
  {
    property: 'build.publish',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { publish: 'dist' } }),
  },
  {
    property: 'build.publish',
    ...insideRootCheck,
    example: (publish) => ({ build: { publish: removeParentDots(publish) } }),
  },
  {
    property: 'build.functions',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { functions: 'functions' } }),
  },
  {
    property: 'build.functions',
    ...insideRootCheck,
    example: (functions) => ({ build: { functions: removeParentDots(functions) } }),
  },
  {
    property: 'build.edge_handlers',
    check: isString,
    message: 'must be a string.',
    example: () => ({ build: { edge_handlers: 'edge-handlers' } }),
  },
  {
    property: 'build.edge_handlers',
    ...insideRootCheck,
    example: (edgeHandlers) => ({ build: { edge_handlers: removeParentDots(edgeHandlers) } }),
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
    property: 'functions.*.included_files.*',
    ...insideRootCheck,
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
    property: 'functionsDirectory',
    check: isString,
    message: 'must be a string.',
    ...functionsDirectoryCheck,
    example: () => ({
      functions: { directory: 'my-functions' },
    }),
  },
  {
    property: 'functionsDirectory',
    ...insideRootCheck,
    ...functionsDirectoryCheck,
    example: (publish) => ({ functions: { directory: removeParentDots(publish) } }),
  },
]

module.exports = {
  PRE_CASE_NORMALIZE_VALIDATIONS,
  PRE_MERGE_VALIDATIONS,
  PRE_CONTEXT_VALIDATIONS,
  PRE_NORMALIZE_VALIDATIONS,
  POST_NORMALIZE_VALIDATIONS,
}
/* eslint-enable max-lines */
