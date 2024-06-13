import type { ArgumentPlaceholder, Expression, SpreadElement, JSXNamespacedName } from '@babel/types'
import mergeOptions from 'merge-options'
import { z } from 'zod'

import { FunctionConfig, functionConfig } from '../../../config.js'
import { InvocationMode, INVOCATION_MODE } from '../../../function.js'
import { rateLimit } from '../../../rate_limit.js'
import { FunctionBundlingUserError } from '../../../utils/error.js'
import { nonNullable } from '../../../utils/non_nullable.js'
import { getRoutes, Route } from '../../../utils/routes.js'
import { RUNTIME } from '../../runtime.js'
import { createBindingsMethod } from '../parser/bindings.js'
import { traverseNodes } from '../parser/exports.js'
import { getImports } from '../parser/imports.js'
import { safelyParseSource, safelyReadSource } from '../parser/index.js'
import type { ModuleFormat } from '../utils/module_format.js'

import { parse as parseSchedule } from './properties/schedule.js'

export const IN_SOURCE_CONFIG_MODULE = '@netlify/functions'

export interface StaticAnalysisResult extends ISCValues {
  inputModuleFormat?: ModuleFormat
  invocationMode?: InvocationMode
  routes?: Route[]
  runtimeAPIVersion?: number
}

interface FindISCDeclarationsOptions {
  functionName: string
}

const httpMethods = z.preprocess(
  (input) => (typeof input === 'string' ? input.toUpperCase() : input),
  z.enum(['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE', 'HEAD']),
)

export const isc = functionConfig
  .pick({
    externalNodeModules: true,
    generator: true,
    includedFiles: true,
    ignoredNodeModules: true,
    name: true,
    nodeBundler: true,
    schedule: true,
    timeout: true,
  })
  .extend({
    methods: z.array(httpMethods).optional().catch(undefined),
    path: z.string().optional().catch(undefined),
    preferStatic: z.boolean().optional(),
    rateLimit: rateLimit.optional().catch(undefined),
  })

export type ISCValues = z.infer<typeof isc>

const validateScheduleFunction = (functionFound: boolean, scheduleFound: boolean, functionName: string): void => {
  if (!functionFound) {
    throw new FunctionBundlingUserError(
      "The `schedule` helper was imported but we couldn't find any usages. If you meant to schedule a function, please check that `schedule` is invoked and `handler` correctly exported.",
      { functionName, runtime: RUNTIME.JAVASCRIPT },
    )
  }

  if (!scheduleFound) {
    throw new FunctionBundlingUserError(
      'Unable to find cron expression for scheduled function. The cron expression (first argument) for the `schedule` helper needs to be accessible inside the file and cannot be imported.',
      { functionName, runtime: RUNTIME.JAVASCRIPT },
    )
  }
}

/**
 * Loads a file at a given path, parses it into an AST, and returns a series of
 * data points, such as in-source configuration properties and other metadata.
 */
export const parseFile = async (
  sourcePath: string,
  { functionName }: FindISCDeclarationsOptions,
): Promise<StaticAnalysisResult> => {
  const source = await safelyReadSource(sourcePath)

  if (source === null) {
    return {}
  }

  return parseSource(source, { functionName })
}

/**
 * Takes a JS/TS source as a string, parses it into an AST, and returns a
 * series of data points, such as in-source configuration properties and
 * other metadata.
 */
export const parseSource = (source: string, { functionName }: FindISCDeclarationsOptions): StaticAnalysisResult => {
  const ast = safelyParseSource(source)

  if (ast === null) {
    return {}
  }

  const imports = ast.body.flatMap((node) => getImports(node, IN_SOURCE_CONFIG_MODULE))
  const scheduledFunctionExpected = imports.some(({ imported }) => imported === 'schedule')

  let scheduledFunctionFound = false
  let scheduleFound = false

  const getAllBindings = createBindingsMethod(ast.body)
  const { configExport, handlerExports, hasDefaultExport, inputModuleFormat } = traverseNodes(ast.body, getAllBindings)
  const isV2API = handlerExports.length === 0 && hasDefaultExport

  if (isV2API) {
    const result: StaticAnalysisResult = {
      inputModuleFormat,
      runtimeAPIVersion: 2,
    }

    try {
      const iscValues = isc.parse(configExport)
      const routes = getRoutes({
        functionName,
        methods: iscValues.methods as string[],
        path: iscValues.path,
        preferStatic: iscValues.preferStatic === true,
      })

      return {
        ...result,
        ...iscValues,
        routes,
      }
    } catch (error) {
      return result
    }
  }

  const iscExports = handlerExports
    .map((node) => {
      // We're only interested in exports with call expressions, since that's
      // the pattern we use for the wrapper functions.
      if (node.type !== 'call-expression') {
        return null
      }

      const { args, local: exportName } = node
      const matchingImport = imports.find(({ local: importName }) => importName === exportName)

      if (matchingImport === undefined) {
        return null
      }

      switch (matchingImport.imported) {
        case 'schedule': {
          const parsed = parseSchedule({ args }, getAllBindings)

          scheduledFunctionFound = true
          if (parsed.schedule) {
            scheduleFound = true
          }

          return parsed
        }

        case 'stream': {
          return {
            invocationMode: INVOCATION_MODE.Stream,
          }
        }

        default:
        // no-op
      }

      return null
    })
    .filter(nonNullable)

  if (scheduledFunctionExpected) {
    validateScheduleFunction(scheduledFunctionFound, scheduleFound, functionName)
  }

  const mergedExports: ISCValues = iscExports.reduce((acc, obj) => ({ ...acc, ...obj }), {})

  return { ...mergedExports, inputModuleFormat, runtimeAPIVersion: 1 }
}

export const augmentFunctionConfig = (
  config: FunctionConfig,
  staticAnalysisResult: StaticAnalysisResult,
): FunctionConfig & StaticAnalysisResult => {
  const iscConfig: FunctionConfig = {}

  // Some of the properties in the static analysis result are generated by us.
  // They don't belong in the config file, so we filter those out by checking
  // whether they belong to the ISC schema.
  for (const key in staticAnalysisResult) {
    if (key in isc.shape) {
      iscConfig[key] = staticAnalysisResult[key]
    }
  }

  return mergeOptions(config, iscConfig)
}

export type ISCHandlerArg = ArgumentPlaceholder | Expression | SpreadElement | JSXNamespacedName

export type ISCExportWithCallExpression = {
  type: 'call-expression'
  args: ISCHandlerArg[]
  local: string
}
export type ISCExportWithObject = {
  type: 'object-expression'
  object: Record<string, unknown>
}
export type ISCExportOther = { type: 'other' }
export type ISCDefaultExport = { type: 'default' }
export type ISCExport = ISCExportWithCallExpression | ISCExportWithObject | ISCExportOther | ISCDefaultExport
