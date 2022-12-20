import { promises as fs } from 'fs'
import { join } from 'path'

import globToRegExp from 'glob-to-regexp'

import type { Bundle } from './bundle.js'
import { Cache } from './config.js'
import type { Declaration } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { Layer } from './layer.js'
import { getPackageVersion } from './package_json.js'
import { nonNullable } from './utils/non_nullable.js'

interface GenerateManifestOptions {
  bundles?: Bundle[]
  declarations?: Declaration[]
  functions: EdgeFunction[]
  importMap?: string
  layers?: Layer[]
}

/* eslint-disable camelcase */
interface Route {
  function: string
  name?: string
  pattern: string
  excluded_pattern?: string
}
interface Manifest {
  bundler_version: string
  bundles: { asset: string; format: string }[]
  import_map?: string
  layers: { name: string; flag: string }[]
  routes: Route[]
  post_cache_routes: Route[]
}
/* eslint-enable camelcase */

interface Route {
  function: string
  name?: string
  pattern: string
}

const serializePattern = (regex: RegExp) => regex.source.replace(/\\\//g, '/')

const generateManifest = ({
  bundles = [],
  declarations = [],
  functions,
  importMap,
  layers = [],
}: GenerateManifestOptions) => {
  const preCacheRoutes: Route[] = []
  const postCacheRoutes: Route[] = []

  declarations.forEach((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      return
    }

    const pattern = getRegularExpression(declaration)
    const route: Route = {
      function: func.name,
      name: declaration.name,
      pattern: serializePattern(pattern),
    }
    const excludedPattern = getExcludedRegularExpression(declaration)
    if (excludedPattern) {
      route.excluded_pattern = serializePattern(excludedPattern)
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

  return new RegExp(normalizedSource)
}

const getRegularExpression = (declaration: Declaration) => {
  if ('pattern' in declaration) {
    return new RegExp(declaration.pattern)
  }

  return pathToRegularExpression(declaration.path)
}

const getExcludedRegularExpression = (declaration: Declaration) => {
  if ('pattern' in declaration && declaration.excludedPattern) {
    return new RegExp(declaration.excludedPattern)
  }

  if ('path' in declaration && declaration.excludedPath) {
    return pathToRegularExpression(declaration.excludedPath)
  }
}

interface WriteManifestOptions {
  bundles: Bundle[]
  declarations: Declaration[]
  distDirectory: string
  functions: EdgeFunction[]
  importMap?: string
  layers?: Layer[]
}

const writeManifest = async ({
  bundles,
  declarations = [],
  distDirectory,
  functions,
  importMap,
  layers,
}: WriteManifestOptions) => {
  const manifest = generateManifest({ bundles, declarations, functions, importMap, layers })
  const manifestPath = join(distDirectory, 'manifest.json')

  await fs.writeFile(manifestPath, JSON.stringify(manifest))

  return manifest
}

export { generateManifest, Manifest, writeManifest }
