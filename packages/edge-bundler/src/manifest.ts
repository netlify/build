import globToRegExp from 'glob-to-regexp'

import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { Handler } from './handler.js'
import { nonNullable } from './utils/non_nullable.js'

interface GenerateManifestOptions {
  bundleAlternates?: BundleAlternate[]
  bundleHash: string
  handlers: Handler[]
  declarations?: Declaration[]
}

const generateManifest = ({
  bundleAlternates = [],
  bundleHash,
  declarations = [],
  handlers,
}: GenerateManifestOptions) => {
  const handlersWithRoutes = declarations.map((declaration) => {
    const handler = handlers.find(({ name }) => declaration.handler === name)

    if (handler === undefined) {
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
    bundle: bundleHash,
    bundle_alternates: bundleAlternates,
    handlers: handlersWithRoutes.filter(nonNullable),
  }

  return manifest
}

export { generateManifest }
