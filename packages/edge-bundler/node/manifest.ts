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
  layers?: Layer[]
}

/* eslint-disable camelcase */
interface Manifest {
  bundler_version: string
  bundles: { asset: string; format: string }[]
  routes: { function: string; name?: string; pattern: string }[]
  post_cache_routes: { function: string; name?: string; pattern: string }[]
  layers: { name: string; flag: string }[]
}
/* eslint-enable camelcase */

interface Route {
  function: string
  name?: string
  pattern: string
}

const generateManifest = ({ bundles = [], declarations = [], functions, layers = [] }: GenerateManifestOptions) => {
  const preCacheRoutes: Route[] = []
  const postCacheRoutes: Route[] = []

  declarations.forEach((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      return
    }

    const pattern = getRegularExpression(declaration)
    const serializablePattern = pattern.source.replace(/\\\//g, '/')
    const route = {
      function: func.name,
      name: declaration.name,
      pattern: serializablePattern,
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
  }

  return manifest
}

const getRegularExpression = (declaration: Declaration) => {
  if ('pattern' in declaration) {
    return new RegExp(declaration.pattern)
  }

  // We use the global flag so that `globToRegExp` will not wrap the expression
  // with `^` and `$`. We'll do that ourselves.
  const regularExpression = globToRegExp(declaration.path, { flags: 'g' })

  // Wrapping the expression source with `^` and `$`. Also, adding an optional
  // trailing slash, so that a declaration of `path: "/foo"` matches requests
  // for both `/foo` and `/foo/`.
  const normalizedSource = `^${regularExpression.source}\\/?$`

  return new RegExp(normalizedSource)
}

interface WriteManifestOptions {
  bundles: Bundle[]
  declarations: Declaration[]
  distDirectory: string
  functions: EdgeFunction[]
  layers?: Layer[]
}

const writeManifest = async ({
  bundles,
  declarations = [],
  distDirectory,
  functions,
  layers,
}: WriteManifestOptions) => {
  const manifest = generateManifest({ bundles, declarations, functions, layers })
  const manifestPath = join(distDirectory, 'manifest.json')

  await fs.writeFile(manifestPath, JSON.stringify(manifest))

  return manifest
}

export { generateManifest, Manifest, writeManifest }
