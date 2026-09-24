import isPlainObj from 'is-plain-obj'

import type { EdgeFunctionDeclaration } from '../types.js'

import {
  checkObject,
  hasOnlyProperties,
  isArrayOfStrings,
  isOneOf,
  isString,
  unknownPropertiesMessage,
} from './common_rules.js'
import type { Rule } from './engine.js'

type EdgeFunctionProperty = keyof EdgeFunctionDeclaration

/** Properties users may set, including in `netlify.toml`. */
const USER_PROPERTIES = [
  'path',
  'excludedPath',
  'pattern',
  'excludedPattern',
  'function',
  'cache',
  'method',
  'header',
  'name',
] as const satisfies readonly EdgeFunctionProperty[]

/** Also allows the properties only frameworks and extensions may set. */
const PROPERTIES = [...USER_PROPERTIES, 'generator'] as const satisfies readonly EdgeFunctionProperty[]

const CACHE_VALUES = ['manual', 'off'] as const satisfies readonly NonNullable<EdgeFunctionDeclaration['cache']>[]

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

const isMethod = (value: unknown): boolean => isString(value) && isOneOf(METHODS, value.toUpperCase())

const isStringOrStrings = (value: unknown): boolean => isString(value) || isArrayOfStrings(value)

const isHeaders = (value: unknown): boolean =>
  isPlainObj(value) &&
  Object.values(value).every((headerValue) => typeof headerValue === 'boolean' || isString(headerValue))

const example = () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] })

/** Stage CF. Entries that aren't objects are reported once sources are merged. */
export const EDGE_FUNCTION_USER_PROPERTIES_RULE: Rule = {
  property: 'edge_functions.*',
  check: (value) => !isPlainObj(value) || hasOnlyProperties(value, USER_PROPERTIES),
  message: unknownPropertiesMessage(USER_PROPERTIES),
  example,
}

/** Stage N, after merging checked that `edge_functions` is an array of objects. */
export const EDGE_FUNCTION_RULES: readonly Rule[] = [
  {
    property: 'edge_functions.*',
    check: checkObject((edgeFunction) => hasOnlyProperties(edgeFunction, PROPERTIES)),
    message: unknownPropertiesMessage(PROPERTIES),
    example,
  },
  {
    property: 'edge_functions.*',
    check: checkObject((edgeFunction) => edgeFunction['path'] !== undefined || edgeFunction['pattern'] !== undefined),
    message: 'either "path" or "pattern" is required.',
    example,
  },
  {
    property: 'edge_functions.*',
    check: checkObject((edgeFunction) => edgeFunction['path'] === undefined || edgeFunction['pattern'] === undefined),
    message: '"path" and "pattern" are mutually exclusive.',
    example,
  },
  {
    property: 'edge_functions.*',
    check: checkObject(
      (edgeFunction) => edgeFunction['excludedPath'] === undefined || edgeFunction['excludedPattern'] === undefined,
    ),
    message: '"excludedPath" and "excludedPattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello/*', function: 'hello', excludedPath: '/hello/no' }] }),
  },
  {
    property: 'edge_functions.*',
    check: checkObject((edgeFunction) => edgeFunction['function'] !== undefined),
    message: '"function" property is required.',
    example,
  },
  {
    property: 'edge_functions.*.path',
    check: isString,
    message: 'must be a string.',
    example,
  },
  {
    property: 'edge_functions.*.excludedPath',
    check: isStringOrStrings,
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
    check: isStringOrStrings,
    message: 'must be a string or array of strings.',
    example: () => ({
      edge_functions: [{ path: '/products/(.*)', excludedPattern: ['^/products/(.*)\\.jpg$'], function: 'customise' }],
    }),
  },
  {
    property: 'edge_functions.*.function',
    check: isString,
    message: 'must be a string.',
    example,
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
    check: (path) => isString(path) && path.startsWith('/'),
    message: 'must be a valid path.',
    example,
  },
  {
    property: 'edge_functions.*.cache',
    check: (cache) => isOneOf(CACHE_VALUES, cache),
    message: `must be one of: ${CACHE_VALUES.join(', ')}`,
    example: () => ({ edge_functions: [{ cache: CACHE_VALUES[0], path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.method',
    check: (method) => isMethod(method) || (Array.isArray(method) && method.length !== 0 && method.every(isMethod)),
    message: `must be one of or array of: ${METHODS.join(', ')}`,
    example: () => ({ edge_functions: [{ method: ['PUT', 'DELETE'], path: '/hello', function: 'hello' }] }),
  },
  {
    property: 'edge_functions.*.header',
    check: isHeaders,
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
