const isPlainObj = require('is-plain-obj')

const { getLifecycleCommand } = require('../normalize/lifecycle')

const { addContextValidations } = require('./context')
const { isString, isUndefined, validProperties, insideRootCheck, removeParentDots } = require('./helpers')

// List of validations performed on the configuration file.
// Validation are performed in order: parent should be before children.
// Each validation is an object with the following properties:
//   - `property` {string}: dot-delimited path to the property.
//     Can contain `*` providing a previous check validates the parent is an
//     object or an array.
//   - `check` {(value) => boolean}: validation check function
//   - `message` {string}: error message
//   - `example` {string}: example of correct code
//   - `warn` {boolean}: whether to print a console message or throw an error
// We use this instead of JSON schema (or others) to get nicer error messages.
const RAW_VALIDATIONS = [
  {
    property: 'plugins',
    check: value => Array.isArray(value) && value.every(isPlainObj),
    message: 'must be an array of objects.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }, { package: 'netlify-plugin-two' }] }),
  },

  // TODO: remove 'id', 'type', 'config', 'enabled' after going GA
  {
    property: 'plugins.*',
    ...validProperties(['package', 'inputs'], ['id', 'type', 'config', 'enabled']),
    example: { plugins: [{ package: 'netlify-plugin-one', inputs: { port: 80 } }] },
  },

  {
    property: 'plugins.*',
    check: ({ package, type }) => package !== undefined || type !== undefined,
    message: '"package" property is required.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },

  // TODO: remove this check after going GA
  {
    property: 'plugins.*.type',
    check: isUndefined,
    message: 'has been renamed to "package".',
    example: type => ({ plugins: [{ package: type }] }),
    warn: true,
  },

  {
    property: 'plugins.*.package',
    check: isString,
    message: 'must be a string.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one' }] }),
  },

  // TODO: remove this check after going GA
  {
    property: 'plugins.*.config',
    check: isUndefined,
    message: 'has been renamed to "inputs".',
    example: inputs => ({ plugins: [{ inputs }] }),
    warn: true,
  },

  {
    property: 'plugins.*.inputs',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ plugins: [{ package: 'netlify-plugin-one', inputs: { port: 80 } }] }),
  },
  {
    property: 'build',
    check: isPlainObj,
    message: 'must be a plain object.',
    example: () => ({ build: { command: 'npm run build' } }),
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
    example: base => ({ build: { base: removeParentDots(base) } }),
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
    example: publish => ({ build: { publish: removeParentDots(publish) } }),
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
    example: functions => ({ build: { functions: removeParentDots(functions) } }),
  },
  {
    property: 'build.command',
    check: isString,
    message: 'must be a string',
    example: () => ({ build: { command: 'npm run build' } }),
  },

  // TODO: remove this check after going GA
  {
    property: 'build.lifecycle',
    check: isUndefined,
    message: 'has been removed. Please use build.command instead.',
    example: lifecycle => ({ build: { command: getLifecycleCommand(lifecycle) } }),
    warn: true,
  },

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

const VALIDATIONS = addContextValidations(RAW_VALIDATIONS)

module.exports = { VALIDATIONS }
