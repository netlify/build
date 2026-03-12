import { dirname } from 'path'

import type {
  ArgumentPlaceholder,
  Declaration,
  Expression,
  ObjectExpression,
  SpreadElement,
  JSXNamespacedName,
} from '@babel/types'
// @ts-expect-error(serhalp) -- Remove once https://github.com/schnittstabil/merge-options/pull/28 is merged, or replace
// this dependency.
import mergeOptions from 'merge-options'
import { z } from 'zod'

import { FunctionConfig, functionConfig } from '../../../config.js'
import { InvocationMode, INVOCATION_MODE } from '../../../function.js'
import { rateLimit } from '../../../rate_limit.js'
import { ensureArray } from '../../../utils/ensure_array.js'
import { FunctionBundlingUserError } from '../../../utils/error.js'
import { ExtendedRoute, Route, getRoutes } from '../../../utils/routes.js'
import { RUNTIME } from '../../runtime.js'
import type { BindingMethod } from '../parser/bindings.js'
import { createBindingsMethod } from '../parser/bindings.js'
import { traverseNodes } from '../parser/exports.js'
import { getImports } from '../parser/imports.js'
import { safelyParseSource, safelyReadSource } from '../parser/index.js'
import type { ModuleFormat } from '../utils/module_format.js'

import { eventHandlers } from '@netlify/serverless-functions-api'
import { parse as parseSchedule } from './properties/schedule.js'

export const IN_SOURCE_CONFIG_MODULE = '@netlify/functions'

export interface StaticAnalysisResult {
  config: InSourceConfig
  eventSubscriptions?: string[]
  excludedRoutes?: Route[]
  inputModuleFormat?: ModuleFormat
  invocationMode?: InvocationMode
  routes?: ExtendedRoute[]
  runtimeAPIVersion?: number
}

interface FindISCDeclarationsOptions {
  functionName: string
}

const httpMethod = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE', 'HEAD'])
const httpMethods = z.preprocess((input) => (typeof input === 'string' ? input.toUpperCase() : input), httpMethod)
const path = z.string().startsWith('/', { message: "Must start with a '/'" })

export type HttpMethod = z.infer<typeof httpMethod>
export type HttpMethods = z.infer<typeof httpMethods>

export const inSourceConfig = functionConfig
  .pick({
    externalNodeModules: true,
    generator: true,
    includedFiles: true,
    ignoredNodeModules: true,
    name: true,
    nodeBundler: true,
    nodeVersion: true,
    schedule: true,
    timeout: true,
  })
  .extend({
    method: z
      .union([httpMethods, z.array(httpMethods)], {
        errorMap: () => ({ message: 'Must be a string or array of strings' }),
      })
      .transform(ensureArray)
      .optional(),
    path: z
      .union([path, z.array(path)], { errorMap: () => ({ message: 'Must be a string or array of strings' }) })
      .transform(ensureArray)
      .optional(),
    excludedPath: z
      .union([path, z.array(path)], { errorMap: () => ({ message: 'Must be a string or array of strings' }) })
      .transform(ensureArray)
      .optional(),
    preferStatic: z.boolean().optional().catch(undefined),
    rateLimit: rateLimit.optional().catch(undefined),
  })

export type InSourceConfig = z.infer<typeof inSourceConfig>

/**
 * Extracts event subscription slugs from the default export expression,
 * if it's an object whose property names match known event handlers.
 */
const getEventSubscriptions = (
  expression: Expression | Declaration | undefined,
  getAllBindings: BindingMethod,
): string[] => {
  let objectExpression: ObjectExpression | undefined

  if (expression?.type === 'ObjectExpression') {
    objectExpression = expression
  } else if (expression?.type === 'Identifier') {
    const binding = getAllBindings().get(expression.name)

    if (binding?.type === 'ObjectExpression') {
      objectExpression = binding
    }
  }

  if (!objectExpression) {
    return []
  }

  const events: string[] = []

  for (const property of objectExpression.properties) {
    let name: string | undefined

    if (
      (property.type === 'ObjectMethod' || property.type === 'ObjectProperty') &&
      property.key.type === 'Identifier'
    ) {
      name = property.key.name
    }

    if (name && name in eventHandlers) {
      events.push(eventHandlers[name as keyof typeof eventHandlers])
    }
  }

  return events
}

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
    return {
      config: {},
    }
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
    return {
      config: {},
    }
  }

  const imports = ast.body.flatMap((node) => getImports(node, IN_SOURCE_CONFIG_MODULE))
  const scheduledFunctionExpected = imports.some(({ imported }) => imported === 'schedule')

  let scheduledFunctionFound = false
  let scheduleFound = false

  const getAllBindings = createBindingsMethod(ast.body)
  const { configExport, handlerExports, hasDefaultExport, defaultExportExpression, inputModuleFormat } = traverseNodes(
    ast.body,
    getAllBindings,
  )
  const isV2API = handlerExports.length === 0 && hasDefaultExport

  if (isV2API) {
    const result: StaticAnalysisResult = {
      config: {},
      inputModuleFormat,
      runtimeAPIVersion: 2,
    }

    const eventSubscriptions = getEventSubscriptions(defaultExportExpression, getAllBindings)

    if (eventSubscriptions.length > 0) {
      result.eventSubscriptions = eventSubscriptions
    }

    const { data, error, success } = inSourceConfig.safeParse(configExport)

    if (success) {
      result.config = data
      result.excludedRoutes = getRoutes(functionName, data.excludedPath)
      result.routes = getRoutes(functionName, data.path).map((route) => ({
        ...route,
        methods: data.method ?? [],
        prefer_static: data.preferStatic || undefined,
      }))
    } else {
      // TODO: Handle multiple errors.
      const [issue] = error.issues

      throw new FunctionBundlingUserError(
        `Function ${functionName} has a configuration error on '${issue.path.join('.')}': ${issue.message}`,
        {
          functionName,
          runtime: RUNTIME.JAVASCRIPT,
        },
      )
    }

    return result
  }

  const result: StaticAnalysisResult = {
    config: {},
    inputModuleFormat,
    runtimeAPIVersion: 1,
  }

  handlerExports.forEach((node) => {
    // We're only interested in exports with call expressions, since that's
    // the pattern we use for the wrapper functions.
    if (node.type !== 'call-expression') {
      return
    }

    const { args, local: exportName } = node
    const matchingImport = imports.find(({ local: importName }) => importName === exportName)

    if (matchingImport === undefined) {
      return
    }

    switch (matchingImport.imported) {
      case 'schedule': {
        const parsed = parseSchedule({ args }, getAllBindings)

        scheduledFunctionFound = true
        if (parsed.schedule) {
          scheduleFound = true
        }

        if (parsed.schedule !== undefined) {
          result.config.schedule = parsed.schedule
        }

        return
      }

      case 'stream': {
        result.invocationMode = INVOCATION_MODE.Stream

        return
      }

      default:
      // no-op
    }

    return
  })

  if (scheduledFunctionExpected) {
    validateScheduleFunction(scheduledFunctionFound, scheduleFound, functionName)
  }

  return result
}

export const augmentFunctionConfig = (
  mainFile: string,
  tomlConfig: FunctionConfig,
  inSourceConfig: InSourceConfig = {},
) => {
  const mergedConfig = mergeOptions.call({ concatArrays: true }, tomlConfig, inSourceConfig) as FunctionConfig &
    InSourceConfig

  // We can't simply merge included files from the TOML and from in-source
  // configuration because their globs are relative to different base paths.
  // In the future, we could shift things around so we resolve each glob
  // relative to the right base, but for now we say that included files in
  // the source override any files defined in the TOML. It doesn't make a lot
  // of sense to be defining include files for a framework-generated function
  // in the TOML anyway.
  if (inSourceConfig?.includedFiles && inSourceConfig.includedFiles.length !== 0) {
    mergedConfig.includedFiles = inSourceConfig.includedFiles
    mergedConfig.includedFilesBasePath = dirname(mainFile)
  }

  return mergedConfig
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
