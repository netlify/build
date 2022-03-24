import globToRegExp from 'glob-to-regexp'

import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { nonNullable } from './utils/non_nullable.js'

interface GenerateManifestOptions {
  bundleAlternates?: BundleAlternate[]
  bundleHash: string
  functions: EdgeFunction[]
  declarations?: Declaration[]
}

const generateManifest = ({
  bundleAlternates = [],
  bundleHash,
  declarations = [],
  functions,
}: GenerateManifestOptions) => {
  const functionsWithRoutes = declarations.map((declaration) => {
    const func = functions.find(({ name }) => declaration.function === name)

    if (func === undefined) {
      return
    }

    const pattern = 'pattern' in declaration ? new RegExp(declaration.pattern) : globToRegExp(declaration.path)
    const serializablePattern = pattern.source.replace(/\\\//g, '/')

    return {
      function: func.name,
      pattern: serializablePattern,
    }
  })
  const manifest = {
    bundle: bundleHash,
    bundle_alternates: bundleAlternates,
    functions: functionsWithRoutes.filter(nonNullable),
  }

  return manifest
}

export { generateManifest }
