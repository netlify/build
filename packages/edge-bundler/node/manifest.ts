import { promises as fs } from 'fs'
import { join } from 'path'

import type { Bundle } from './bundle.js'
import { wrapBundleError } from './bundle_error.js'
import { Cache, FunctionConfig, FunctionConfigWithAllPossibleFields, Path } from './config.js'
import { Declaration, type HeaderMatch, getHeaderMatchers, normalizePattern } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { FeatureFlags } from './feature_flags.js'
import { Layer } from './layer.js'
import { getPackageVersion } from './package_json.js'
import { RateLimit, RateLimitAction, RateLimitAlgorithm, RateLimitAggregator } from './rate_limit.js'
import { nonNullable } from './utils/non_nullable.js'
import { getRegexpFromURLPatternPath } from './utils/urlpattern.js'

interface Route {
  function: string
  headers?: Record<string, HeaderMatch>
  pattern: string
  excluded_patterns: string[]
  path?: string
  methods?: string[]
}

interface TrafficRules {
  action: {
    type: string
    config: {
      rate_limit_config: {
        algorithm: string
        window_size: number
        window_limit: number
      }
      aggregate: {
        keys: {
          type: string
        }[]
      }
      to?: string
    }
  }
}

export interface EdgeFunctionConfig {
  excluded_patterns: string[]
  on_error?: string
  generator?: string
  name?: string
  traffic_rules?: TrafficRules
}

interface Manifest {
  bundler_version: string
  bundles: { asset: string; format: string }[]
  import_map?: string
  layers: { name: string; flag: string }[]
  routes: Route[]
  post_cache_routes: Route[]
  function_config: Record<string, EdgeFunctionConfig>
}

interface GenerateManifestOptions {
  bundles?: Bundle[]
  declarations?: Declaration[]
  featureFlags?: FeatureFlags
  functions: EdgeFunction[]
  importMap?: string
  internalFunctionConfig?: Record<string, FunctionConfig>
  layers?: Layer[]
  userFunctionConfig?: Record<string, FunctionConfig>
}

const removeEmptyConfigValues = (functionConfig: EdgeFunctionConfig) =>
  Object.entries(functionConfig).reduce((acc, [key, value]) => {
    if (value && !(Array.isArray(value) && value.length === 0)) {
      return { ...acc, [key]: value }
    }
    return acc
  }, {} as EdgeFunctionConfig)

// JavaScript regular expressions are converted to strings with leading and
// trailing slashes, so any slashes inside the expression itself are escaped
// as `//`. This function deserializes that back into a single slash, which
// is the format we want to use in the manifest.
const serializePattern = (pattern: string) => pattern.replace(/\\\//g, '/')

const sanitizeEdgeFunctionConfig = (config: Record<string, EdgeFunctionConfig>): Record<string, EdgeFunctionConfig> => {
  const newConfig: Record<string, EdgeFunctionConfig> = {}

  for (const [name, functionConfig] of Object.entries(config)) {
    const newFunctionConfig = removeEmptyConfigValues(functionConfig)

    if (Object.keys(newFunctionConfig).length !== 0) {
      newConfig[name] = newFunctionConfig
    }
  }

  return newConfig
}

const addManifestExcludedPatternsFromConfigExcludedPath = (
  name: string,
  manifestFunctionConfig: Record<string, EdgeFunctionConfig>,
  excludedPath?: Path | Path[],
) => {
  if (excludedPath) {
    const paths = Array.isArray(excludedPath) ? excludedPath : [excludedPath]
    const excludedPatterns = paths.map(pathToRegularExpression).filter(nonNullable).map(serializePattern)

    manifestFunctionConfig[name].excluded_patterns.push(...excludedPatterns)
  }
}

const addManifestExcludedPatternsFromConfigExcludedPattern = (
  name: string,
  manifestFunctionConfig: Record<string, EdgeFunctionConfig>,
  excludedPattern?: string | string[],
) => {
  if (excludedPattern) {
    const excludedPatterns = Array.isArray(excludedPattern) ? excludedPattern : [excludedPattern]
    const normalizedExcludedPatterns = excludedPatterns.filter(nonNullable).map(normalizePattern).map(serializePattern)

    manifestFunctionConfig[name].excluded_patterns.push(...normalizedExcludedPatterns)
  }
}

/**
 * Normalizes method names into arrays of uppercase strings.
 * (e.g. "get" becomes ["GET"])
 */
const normalizeMethods = (method: unknown, name: string): string[] | undefined => {
  const methods = Array.isArray(method) ? method : [method]
  return methods.map((method) => {
    if (typeof method !== 'string') {
      throw new TypeError(
        `Could not parse method declaration of function '${name}'. Expecting HTTP Method, got ${method}`,
      )
    }

    return method.toUpperCase()
  })
}

const generateManifest = ({
  bundles = [],
  declarations = [],
  functions,
  userFunctionConfig = {},
  internalFunctionConfig = {},
  importMap,
  layers = [],
}: GenerateManifestOptions) => {
  const preCacheRoutes: Route[] = []
  const postCacheRoutes: Route[] = []
  const manifestFunctionConfig: Manifest['function_config'] = Object.fromEntries(
    functions.map(({ name }) => [name, { excluded_patterns: [] }]),
  )
  const routedFunctions = new Set<string>()
  const declarationsWithoutFunction = new Set<string>()

  for (const [name, singleUserFunctionConfig] of Object.entries(userFunctionConfig)) {
    // If the config block is for a function that is not defined, discard it.
    if (manifestFunctionConfig[name] === undefined) {
      continue
    }

    const { excludedPath, pattern, excludedPattern, onError, rateLimit } =
      singleUserFunctionConfig as FunctionConfigWithAllPossibleFields

    if (pattern && excludedPattern) {
      addManifestExcludedPatternsFromConfigExcludedPattern(name, manifestFunctionConfig, excludedPattern)
    } else {
      addManifestExcludedPatternsFromConfigExcludedPath(name, manifestFunctionConfig, excludedPath)
    }

    manifestFunctionConfig[name] = {
      ...manifestFunctionConfig[name],
      on_error: onError,
      traffic_rules: getTrafficRulesConfig(rateLimit),
    }
  }

  for (const [name, singleInternalFunctionConfig] of Object.entries(internalFunctionConfig)) {
    // If the config block is for a function that is not defined, discard it.
    if (manifestFunctionConfig[name] === undefined) {
      continue
    }

    const { onError, rateLimit, path, excludedPath, pattern, excludedPattern, ...rest } =
      singleInternalFunctionConfig as FunctionConfigWithAllPossibleFields

    if (pattern && excludedPattern) {
      addManifestExcludedPatternsFromConfigExcludedPattern(name, manifestFunctionConfig, excludedPattern)
    } else {
      addManifestExcludedPatternsFromConfigExcludedPath(name, manifestFunctionConfig, excludedPath)
    }

    manifestFunctionConfig[name] = {
      ...manifestFunctionConfig[name],
      on_error: onError,
      traffic_rules: getTrafficRulesConfig(rateLimit),
      ...rest,
    }
  }

  declarations.forEach((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      declarationsWithoutFunction.add(declaration.function)

      return
    }

    const pattern = getRegularExpression(declaration)

    // If there is no `pattern`, the declaration will never be triggered, so we
    // can discard it.
    if (!pattern) {
      return
    }

    routedFunctions.add(declaration.function)

    const excludedPattern = getExcludedRegularExpressions(declaration)
    const route: Route = {
      function: func.name,
      pattern: serializePattern(pattern),
      excluded_patterns: excludedPattern.map(serializePattern),
    }

    if ('method' in declaration) {
      route.methods = normalizeMethods(declaration.method, func.name)
    }

    if ('header' in declaration) {
      route.headers = getHeaderMatchers(declaration.header)
    }

    if ('path' in declaration) {
      route.path = declaration.path
    }

    if (declaration.cache === Cache.Manual) {
      postCacheRoutes.push(route)
    } else {
      preCacheRoutes.push(route)
    }
  })
  const manifestBundles = bundles.map(({ extension, format, hash }) => ({
    asset: hash + extension,
    format,
  }))
  const manifest: Manifest = {
    bundles: manifestBundles,
    routes: preCacheRoutes.filter(nonNullable),
    post_cache_routes: postCacheRoutes.filter(nonNullable),
    bundler_version: getPackageVersion(),
    layers,
    import_map: importMap,
    function_config: sanitizeEdgeFunctionConfig(manifestFunctionConfig),
  }
  const unroutedFunctions = functions.filter(({ name }) => !routedFunctions.has(name)).map(({ name }) => name)

  return { declarationsWithoutFunction: [...declarationsWithoutFunction], manifest, unroutedFunctions }
}

const getTrafficRulesConfig = (rl: RateLimit | undefined) => {
  if (rl === undefined) {
    return
  }

  const rateLimitAgg = Array.isArray(rl.aggregateBy) ? rl.aggregateBy : [RateLimitAggregator.Domain]
  const rewriteConfig = 'to' in rl && typeof rl.to === 'string' ? { to: rl.to } : undefined

  return {
    action: {
      type: rl.action || RateLimitAction.Limit,
      config: {
        ...rewriteConfig,
        rate_limit_config: {
          window_limit: rl.windowLimit,
          window_size: rl.windowSize,
          algorithm: RateLimitAlgorithm.SlidingWindow,
        },
        aggregate: {
          keys: rateLimitAgg.map((agg) => ({ type: agg })),
        },
      },
    },
  }
}

const pathToRegularExpression = (path: string) => {
  if (!path) {
    return null
  }

  try {
    // Removing the `^` and `$` delimiters because we'll need to modify what's
    // between them.
    const source = getRegexpFromURLPatternPath(path).slice(1, -1)

    // Wrapping the expression source with `^` and `$`. Also, adding an optional
    // trailing slash, so that a declaration of `path: "/foo"` matches requests
    // for both `/foo` and `/foo/`.
    const normalizedSource = `^${source}\\/?$`

    return normalizedSource
  } catch (error) {
    throw wrapBundleError(error)
  }
}

const getRegularExpression = (declaration: Declaration) => {
  if ('pattern' in declaration) {
    try {
      return normalizePattern(declaration.pattern)
    } catch (error: unknown) {
      throw wrapBundleError(
        new Error(
          `Could not parse path declaration of function '${declaration.function}': ${(error as Error).message}`,
        ),
      )
    }
  }

  return pathToRegularExpression(declaration.path)
}

const getExcludedRegularExpressions = (declaration: Declaration): string[] => {
  if ('excludedPattern' in declaration && declaration.excludedPattern) {
    const excludedPatterns: string[] = Array.isArray(declaration.excludedPattern)
      ? declaration.excludedPattern
      : [declaration.excludedPattern]

    return excludedPatterns.map((excludedPattern) => {
      try {
        return normalizePattern(excludedPattern)
      } catch (error: unknown) {
        throw wrapBundleError(
          new Error(
            `Could not parse path declaration of function '${declaration.function}': ${(error as Error).message}`,
          ),
        )
      }
    })
  }

  if ('path' in declaration && declaration.excludedPath) {
    const paths = Array.isArray(declaration.excludedPath) ? declaration.excludedPath : [declaration.excludedPath]

    return paths.map(pathToRegularExpression).filter(nonNullable)
  }

  return []
}

interface WriteManifestOptions extends GenerateManifestOptions {
  distDirectory: string
}

const writeManifest = async ({ distDirectory, ...rest }: WriteManifestOptions) => {
  const { manifest } = generateManifest(rest)
  const manifestPath = join(distDirectory, 'manifest.json')

  await fs.writeFile(manifestPath, JSON.stringify(manifest))

  return manifest
}

export { generateManifest, Manifest, Route, writeManifest }
