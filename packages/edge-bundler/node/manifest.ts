import { promises as fs } from 'fs'
import { join } from 'path'

import type { Bundle } from './bundle.js'
import { wrapBundleError } from './bundle_error.js'
import { Cache, FunctionConfig, Path } from './config.js'
import { Declaration, parsePattern } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { FeatureFlags } from './feature_flags.js'
import { Layer } from './layer.js'
import { getPackageVersion } from './package_json.js'
import { nonNullable } from './utils/non_nullable.js'
import { ExtendedURLPattern } from './utils/urlpattern.js'

interface Route {
  function: string
  pattern: string
  excluded_patterns: string[]
  path?: string
}

interface EdgeFunctionConfig {
  excluded_patterns: string[]
  on_error?: string
  generator?: string
  name?: string
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

const addExcludedPatterns = (
  name: string,
  manifestFunctionConfig: Record<string, EdgeFunctionConfig>,
  excludedPath?: Path | Path[],
) => {
  if (excludedPath) {
    const paths = Array.isArray(excludedPath) ? excludedPath : [excludedPath]
    const excludedPatterns = paths.map((path) => pathToRegularExpression(path)).map(serializePattern)

    manifestFunctionConfig[name].excluded_patterns.push(...excludedPatterns)
  }
}

const generateManifest = ({
  bundles = [],
  declarations = [],
  featureFlags,
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

  for (const [name, { excludedPath, onError }] of Object.entries(userFunctionConfig)) {
    // If the config block is for a function that is not defined, discard it.
    if (manifestFunctionConfig[name] === undefined) {
      continue
    }
    addExcludedPatterns(name, manifestFunctionConfig, excludedPath)

    manifestFunctionConfig[name] = { ...manifestFunctionConfig[name], on_error: onError }
  }

  for (const [name, { excludedPath, path, onError, ...rest }] of Object.entries(internalFunctionConfig)) {
    // If the config block is for a function that is not defined, discard it.
    if (manifestFunctionConfig[name] === undefined) {
      continue
    }
    addExcludedPatterns(name, manifestFunctionConfig, excludedPath)

    manifestFunctionConfig[name] = { ...manifestFunctionConfig[name], on_error: onError, ...rest }
  }

  declarations.forEach((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      return
    }

    const pattern = getRegularExpression(declaration, featureFlags)
    const excludedPattern = getExcludedRegularExpressions(declaration, featureFlags)

    const route: Route = {
      function: func.name,
      pattern: serializePattern(pattern),
      excluded_patterns: excludedPattern.map(serializePattern),
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

  return manifest
}

const pathToRegularExpression = (path: string) => {
  try {
    const pattern = new ExtendedURLPattern({ pathname: path })

    // Removing the `^` and `$` delimiters because we'll need to modify what's
    // between them.
    const source = pattern.regexp.pathname.source.slice(1, -1)

    // Wrapping the expression source with `^` and `$`. Also, adding an optional
    // trailing slash, so that a declaration of `path: "/foo"` matches requests
    // for both `/foo` and `/foo/`.
    const normalizedSource = `^${source}\\/?$`

    return normalizedSource
  } catch (error) {
    throw wrapBundleError(error)
  }
}

const getRegularExpression = (declaration: Declaration, featureFlags?: FeatureFlags): string => {
  if ('pattern' in declaration) {
    try {
      return parsePattern(declaration.pattern)
    } catch (error: unknown) {
      // eslint-disable-next-line max-depth
      if (featureFlags?.edge_functions_fail_unsupported_regex) {
        throw new Error(
          `Could not parse path declaration of function '${declaration.function}': ${(error as Error).message}`,
        )
      }

      console.warn(
        `Function '${declaration.function}' uses an unsupported regular expression and will not be invoked: ${
          (error as Error).message
        }`,
      )

      return declaration.pattern
    }
  }

  return pathToRegularExpression(declaration.path)
}

const getExcludedRegularExpressions = (declaration: Declaration, featureFlags?: FeatureFlags): string[] => {
  if ('excludedPattern' in declaration && declaration.excludedPattern) {
    const excludedPatterns: string[] = Array.isArray(declaration.excludedPattern)
      ? declaration.excludedPattern
      : [declaration.excludedPattern]
    return excludedPatterns.map((excludedPattern) => {
      try {
        return parsePattern(excludedPattern)
      } catch (error: unknown) {
        if (featureFlags?.edge_functions_fail_unsupported_regex) {
          throw new Error(
            `Could not parse path declaration of function '${declaration.function}': ${(error as Error).message}`,
          )
        }

        console.warn(
          `Function '${
            declaration.function
          }' uses an unsupported regular expression and will therefore not be invoked: ${(error as Error).message}`,
        )

        return excludedPattern
      }
    })
  }

  if ('path' in declaration && declaration.excludedPath) {
    const paths = Array.isArray(declaration.excludedPath) ? declaration.excludedPath : [declaration.excludedPath]
    return paths.map((path) => pathToRegularExpression(path))
  }

  return []
}

interface WriteManifestOptions extends GenerateManifestOptions {
  distDirectory: string
}

const writeManifest = async ({ distDirectory, ...rest }: WriteManifestOptions) => {
  const manifest = generateManifest(rest)
  const manifestPath = join(distDirectory, 'manifest.json')

  await fs.writeFile(manifestPath, JSON.stringify(manifest))

  return manifest
}

export { generateManifest, Manifest, Route, writeManifest }
