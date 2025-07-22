import { isString, validProperties } from './validate/helpers.js'

const cacheValues = ['manual', 'off']
const methodValues = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

const isMethod = (value: unknown) => typeof value === 'string' && methodValues.includes(value.toUpperCase())

const isValidHeaderValue = (value: unknown) => typeof value === 'boolean' || typeof value === 'string'
const isValidHeaders = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every(isValidHeaderValue)

export const validations = [
  {
    property: 'edge_functions.*',
    ...validProperties(
      ['path', 'excludedPath', 'pattern', 'excludedPattern', 'function', 'cache', 'method', 'header'],
      [],
    ),
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
    check: (edgeFunction) => !(edgeFunction.excludedPath !== undefined && edgeFunction.excludedPattern !== undefined),
    message: '"excludedPath" and "excludedPattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello/*', function: 'hello', excludedPath: '/hello/no' }] }),
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
      edge_functions: [{ path: '/products/(.*)', excludedPattern: ['^/products/(.*)\\.jpg$'], function: 'customise' }],
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
  {
    property: 'edge_functions.*.method',
    check: (value) => isMethod(value) || (Array.isArray(value) && value.length !== 0 && value.every(isMethod)),
    message: `must be one of or array of: ${methodValues.join(', ')}`,
    example: () => ({ edge_functions: [{ method: ['PUT', 'DELETE'], path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.header',
    check: isValidHeaders,
    message: 'must be an object with string keys and boolean or string values.',
    example: () => ({
      edge_functions: [
        {
          path: '/hello',
          function: 'hello',
          header: {
            'x-must-be-present': true,
            'x-must-not-be-present': false,
            'x-must-match-value': '^(value1|value2)$',
          },
        },
      ],
    }),
  },
]
