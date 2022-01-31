import globToRegExp from 'glob-to-regexp'

import type { Declaration } from './declaration.js'
import { Handler } from './handler.js'
import { nonNullable } from './utils/non_nullable.js'

const generateManifest = (bundlePath: string, handlers: Handler[], declarations: Declaration[]) => {
  const handlersWithRoutes = handlers.map((handler) => {
    const declaration = declarations.find((candidate) => candidate.handler === handler.name)

    if (declaration === undefined) {
      return
    }

    const pattern = 'pattern' in declaration ? new RegExp(declaration.pattern) : globToRegExp(declaration.path)

    return {
      handler: handler.name,
      pattern: pattern.toString(),
    }
  })
  const manifest = {
    bundle: bundlePath,
    handlers: handlersWithRoutes.filter(nonNullable),
  }

  return manifest
}

export { generateManifest }
