import isPlainObj from 'is-plain-obj'
import * as z from 'zod'

import type { EdgeFunctionDeclaration } from './types/config.js'
import { isString, validProperties } from './validate/helpers.js'
import { checked, type createRules } from './validate/rule.js'

const cacheValues = ['manual', 'off'] as const
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

// Earlier checks ensure each declaration is an object.
const declaration = (value: unknown): Partial<Record<keyof EdgeFunctionDeclaration, unknown>> =>
  isPlainObj(value) ? value : {}

const allProperties = validProperties([...EDGE_FUNCTIONS_PROPERTIES, ...EDGE_FUNCTIONS_INTERNAL_PROPERTIES], [])

/** Checks on the merged `edge_functions`, which are ranked after the rules already created by `rule`. */
export const createEdgeFunctionsSchema = function (rule: ReturnType<typeof createRules>) {
  const properties = rule({
    // This runs on the merged configuration, which may include properties from the Frameworks API,
    // so it allows every property. The `netlify.toml` checks restrict what users may set.
    message: allProperties.message,
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const pathOrPattern = rule({
    message: 'either "path" or "pattern" is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const pathAndPattern = rule({
    message: '"path" and "pattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const excludedPathAndPattern = rule({
    message: '"excludedPath" and "excludedPattern" are mutually exclusive.',
    example: () => ({ edge_functions: [{ path: '/hello/*', function: 'hello', excludedPath: '/hello/no' }] }),
  })
  const functionRequired = rule({
    message: '"function" property is required.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const pathString = rule({
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const excludedPath = rule({
    message: 'must be a string or array of strings.',
    example: () => ({
      edge_functions: [{ path: '/products/*', excludedPath: ['/products/*.jpg'], function: 'customise' }],
    }),
  })
  const pattern = rule({
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ pattern: '/hello/(.*)', function: 'hello' }] }),
  })
  const excludedPattern = rule({
    message: 'must be a string or array of strings.',
    example: () => ({
      edge_functions: [{ path: '/products/(.*)', excludedPattern: ['^/products/(.*)\\.jpg$'], function: 'customise' }],
    }),
  })
  const functionName = rule({
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const name = rule({
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello', name: 'Hello' }] }),
  })
  const generator = rule({
    message: 'must be a string.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello', generator: 'package-name@1.2.3' }] }),
  })
  const pathValid = rule({
    message: 'must be a valid path.',
    example: () => ({ edge_functions: [{ path: '/hello', function: 'hello' }] }),
  })
  const cache = rule({
    message: `must be one of: ${cacheValues.join(', ')}`,
    example: () => ({ edge_functions: [{ cache: cacheValues[0], path: '/hello', function: 'hello' }] }),
  })
  const method = rule({
    message: `must be one of or array of: ${methodValues.join(', ')}`,
    example: () => ({ edge_functions: [{ method: ['PUT', 'DELETE'], path: '/hello', function: 'hello' }] }),
  })
  const header = rule({
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
  })

  const stringOrStrings = z.union([z.string(), z.array(z.string())])
  const declarationSchema: z.ZodType<EdgeFunctionDeclaration> = checked(
    z.looseObject({
      path: checked(
        z.string(),
        [pathString, isString],
        [pathValid, (value) => String(value).startsWith('/')],
      ).optional(),
      excludedPath: checked(stringOrStrings, [excludedPath, isStringOrArrayOfStrings]).optional(),
      pattern: checked(z.string(), [pattern, isString]).optional(),
      excludedPattern: checked(stringOrStrings, [excludedPattern, isStringOrArrayOfStrings]).optional(),
      function: checked(z.string(), [functionName, isString]),
      name: checked(z.string(), [name, isString]).optional(),
      generator: checked(z.string(), [generator, isString]).optional(),
      cache: checked(z.enum(cacheValues), [
        cache,
        (value) => cacheValues.includes(value as (typeof cacheValues)[number]),
      ]).optional(),
      method: checked(stringOrStrings, [
        method,
        (value) => isMethod(value) || (Array.isArray(value) && value.length !== 0 && value.every(isMethod)),
      ]).optional(),
      header: checked(z.record(z.string(), z.union([z.string(), z.boolean()])), [header, isValidHeaders]).optional(),
    }),
    [properties, allProperties.check],
    [pathOrPattern, (value) => declaration(value).path !== undefined || declaration(value).pattern !== undefined],
    [pathAndPattern, (value) => !(declaration(value).path !== undefined && declaration(value).pattern !== undefined)],
    [
      excludedPathAndPattern,
      (value) => !(declaration(value).excludedPath !== undefined && declaration(value).excludedPattern !== undefined),
    ],
    [functionRequired, (value) => declaration(value).function !== undefined],
  )
  return z.array(declarationSchema)
}
