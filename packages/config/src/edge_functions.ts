import isPlainObj from 'is-plain-obj'

import type { EdgeFunctionDeclaration } from './types/config.js'
import type { Validation } from './validate/types.js'
import { isString, validProperties } from './validate/helpers.js'

const cacheValues = ['manual', 'off']
const methodValues = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

const isMethod = (value: unknown) => typeof value === 'string' && methodValues.includes(value.toUpperCase())

const isStringOrArrayOfStrings = (value: unknown) => isString(value) || (Array.isArray(value) && value.every(isString))

const isValidHeaderValue = (value: unknown) => typeof value === 'boolean' || typeof value === 'string'

const isValidHeaders = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).every(isValidHeaderValue)

/** Properties an edge function declaration may set from any origin, including `netlify.toml`. */
export const EDGE_FUNCTIONS_PROPERTIES = [
  'path',
  'excludedPath',
  'pattern',
  'excludedPattern',
  'function',
  'cache',
  'method',
  'header',
  'name',
] as const

/** Properties only platform-generated configuration may set, through the Frameworks API, never `netlify.toml`. */
export const EDGE_FUNCTIONS_INTERNAL_PROPERTIES = ['generator'] as const

// Earlier validations ensure each declaration is an object.
const declaration = (value: unknown): Partial<Record<keyof EdgeFunctionDeclaration, unknown>> =>
  isPlainObj(value) ? value : {}

export const validations: Validation[] = [
  {
    property: 'edge_functions.*',
    // This runs on the merged configuration, which may include properties from the Frameworks API,
    // so it allows every property. `CONFIG_FILE_VALIDATIONS` restricts what users may set.
    ...validProperties([...EDGE_FUNCTIONS_PROPERTIES, ...EDGE_FUNCTIONS_INTERNAL_PROPERTIES], []),
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (value) => declaration(value).path !== undefined || declaration(value).pattern !== undefined,
    message: 'either "path" or "pattern" is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (value) => !(declaration(value).path !== undefined && declaration(value).pattern !== undefined),
    message: '"path" and "pattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (value) =>
      !(declaration(value).excludedPath !== undefined && declaration(value).excludedPattern !== undefined),
    message: '"excludedPath" and "excludedPattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello/*', function: 'hello', excludedPath: '/hello/no' }] }),
  },
  {
    property: 'edge_functions.*',
    check: (value) => declaration(value).function !== undefined,
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
    check: isStringOrArrayOfStrings,
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
    check: isStringOrArrayOfStrings,
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
    property: 'edge_functions.*.name',
    check: isString,
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello', name: 'Hello' }] }),
  },
  {
    property: 'edge_functions.*.generator',
    check: isString,
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello', generator: 'package-name@1.2.3' }] }),
  },
  {
    property: 'edge_functions.*.path',
    // An earlier validation ensures this is a string.
    check: (pathName) => String(pathName).startsWith('/'),
    message: 'must be a valid path.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.cache',
    check: (value) => cacheValues.includes(value as string),
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
