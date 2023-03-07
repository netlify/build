import { promises as fs } from 'fs'
import { join } from 'path'

import globToRegExp from 'glob-to-regexp'

import type { Bundle } from './bundle.js'
import { Cache, FunctionConfig } from './config.js'
import { Declaration, parsePattern } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { FeatureFlags } from './feature_flags.js'
import { Layer } from './layer.js'
import { getPackageVersion } from './package_json.js'
import { nonNullable } from './utils/non_nullable.js'

interface Route {
  function: string
  name?: string
  pattern: string
  generator?: string
}
interface EdgeFunctionConfig {
  excluded_patterns: string[]
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
  functionConfig?: Record<string, FunctionConfig>
  importMap?: string
  layers?: Layer[]
}

interface Route {
  function: string
  name?: string
  pattern: string
  generator?: string
}

// JavaScript regular expressions are converted to strings with leading and
// trailing slashes, so any slashes inside the expression itself are escaped
// as `//`. This function deserializes that back into a single slash, which
// is the format we want to use in the manifest.
const serializePattern = (pattern: string) => pattern.replace(/\\\//g, '/')

const sanitizeEdgeFunctionConfig = (config: Record<string, EdgeFunctionConfig>): Record<string, EdgeFunctionConfig> => {
  const newConfig: Record<string, EdgeFunctionConfig> = {}

  for (const [name, functionConfig] of Object.entries(config)) {
    if (functionConfig.excluded_patterns.length !== 0) {
      newConfig[name] = functionConfig
    }
  }

  return newConfig
}

const generateManifest = ({
  bundles = [],
  declarations = [],
  featureFlags,
  functions,
  functionConfig = {},
  importMap,
  layers = [],
}: GenerateManifestOptions) => {
  const preCacheRoutes: Route[] = []
  const postCacheRoutes: Route[] = []
  const manifestFunctionConfig: Manifest['function_config'] = Object.fromEntries(
    functions.map(({ name }) => [name, { excluded_patterns: [] }]),
  )

  for (const [name, { excludedPath }] of Object.entries(functionConfig)) {
    if (excludedPath) {
      const paths = Array.isArray(excludedPath) ? excludedPath : [excludedPath]
      const excludedPatterns = paths.map(pathToRegularExpression).map(serializePattern)

      manifestFunctionConfig[name].excluded_patterns.push(...excludedPatterns)
    }
  }

  declarations.forEach((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      return
    }

    const pattern = getRegularExpression(declaration, featureFlags?.edge_functions_fail_unsupported_regex)
    const route: Route = {
      function: func.name,
      name: declaration.name,
      pattern: serializePattern(pattern),
      generator: declaration.generator,
    }
    const excludedPattern = getExcludedRegularExpression(
      declaration,
      featureFlags?.edge_functions_fail_unsupported_regex,
    )

    if (excludedPattern) {
      manifestFunctionConfig[func.name].excluded_patterns.push(serializePattern(excludedPattern))
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
  // We use the global flag so that `globToRegExp` will not wrap the expression
  // with `^` and `$`. We'll do that ourselves.
  const regularExpression = globToRegExp(path, { flags: 'g' })

  // Wrapping the expression source with `^` and `$`. Also, adding an optional
  // trailing slash, so that a declaration of `path: "/foo"` matches requests
  // for both `/foo` and `/foo/`.
  const normalizedSource = `^${regularExpression.source}\\/?$`

  return normalizedSource
}

const getRegularExpression = (declaration: Declaration, failUnsupportedRegex = false) => {
  if ('pattern' in declaration) {
    try {
      return parsePattern(declaration.pattern)
    } catch (error: unknown) {
      // eslint-disable-next-line max-depth
      if (failUnsupportedRegex) {
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

const getExcludedRegularExpression = (declaration: Declaration, failUnsupportedRegex = false) => {
  if ('excludedPattern' in declaration && declaration.excludedPattern) {
    try {
      return parsePattern(declaration.excludedPattern)
    } catch (error: unknown) {
      // eslint-disable-next-line max-depth
      if (failUnsupportedRegex) {
        throw new Error(
          `Could not parse path declaration of function '${declaration.function}': ${(error as Error).message}`,
        )
      }

      console.warn(
        `Function '${declaration.function}' uses an unsupported regular expression and will therefore not be invoked: ${
          (error as Error).message
        }`,
      )

      return declaration.excludedPattern
    }
  }

  if ('path' in declaration && declaration.excludedPath) {
    return pathToRegularExpression(declaration.excludedPath)
  }
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

export { generateManifest, Manifest, writeManifest }
