import globToRegExp from 'glob-to-regexp'

import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { Handler } from './handler.js'
import { nonNullable } from './utils/non_nullable.js'

interface GenerateManifestOptions {
  bundleAlternates?: BundleAlternate[]
  bundlePath: string
  handlers: Handler[]
  declarations?: Declaration[]
}

const generateManifest = ({
  bundleAlternates = [],
  bundlePath,
  declarations = [],
  handlers,
}: GenerateManifestOptions) => {
  const handlersWithRoutes = handlers.map((handler) => {
    const declaration = declarations.find((candidate) => candidate.handler === handler.name)

    if (declaration === undefined) {
      return
    }

    const pattern = 'pattern' in declaration ? new RegExp(declaration.pattern) : globToRegExp(declaration.path)
    const serializablePattern = pattern.source.replace(/\\\//g, '/')

    return {
      handler: handler.name,
      pattern: serializablePattern,
    }
  })
  const manifest = {
    bundle: bundlePath,
    bundle_alternates: bundleAlternates,
    handlers: handlersWithRoutes.filter(nonNullable),
  }

  return manifest
}

export { generateManifest }
