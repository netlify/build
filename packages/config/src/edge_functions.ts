import { isString, validProperties } from './validate/helpers.js'

const cacheValues = ['manual', 'off']

export const validations = [
  {
    property: 'edge_functions.*',
    ...validProperties(['path', 'excludedPath', 'pattern', 'excludedPattern', 'function', 'cache'], []),
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (edgeFunction) => edgeFunction.path !== undefined || edgeFunction.pattern !== undefined,
    message: 'either "path" or "pattern" is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (edgeFunction) => !(edgeFunction.path !== undefined && edgeFunction.pattern !== undefined),
    message: '"path" and "pattern" are mutually exclusive.',
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
    property: 'edge_functions.*.excludedPath',
    check: (value) => isString(value) || (Array.isArray(value) && value.every(isString)),
    message: 'must be a string or array of strings.',
    example: () => ({
      edge_functions: [{ path: '/products/*', excludedPath: ['/products/*.jpg'], function: 'customise' }],
    }),
  },
  {
    property: 'edge_functions.*',
    check: (value) => value.excludedPath === undefined || value.path !== undefined,
    message: '"excludedPath" can only be specified together with "path".',
    example: () => ({
      edge_functions: [{ path: '/products/*', excludedPath: ['/products/*.jpg'], function: 'customise' }],
    }),
  },
  {
    property: 'edge_functions.*.pattern',
    check: isString,
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ pattern: '/hello/(.*)', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.excludedPattern',
    check: (value) => isString(value) || (Array.isArray(value) && value.every(isString)),
    message: 'must be a string or array of strings.',
    example: () => ({
      edge_functions: [{ path: '/products/(.*)', excludedPath: ['/products/(.*)\\.jpg'], function: 'customise' }],
    }),
  },
  {
    property: 'edge_functions.*.excludedPattern',
    check: (value) => value.excludedPattern === undefined || value.pattern !== undefined,
    message: '"excludedPattern" can only be specified together with "pattern".',
    example: () => ({
      edge_functions: [{ path: '/products/(.*)', excludedPath: ['/products/(.*)\\.jpg'], function: 'customise' }],
    }),
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
  {
    property: 'edge_functions.*.cache',
    check: (value) => cacheValues.includes(value),
    message: `must be one of: ${cacheValues.join(', ')}`,
    example: () => ({ edge_functions: [{ cache: cacheValues[0], path: '/hello', function: 'hello' }] }),
  },
]
