/**
 * This module provides functions to resolve module paths using Node.js resolution.
 *
 * TODO(serhalp): Replace all this with `import.meta.resolve()` when all Node.js versions we support
 * support it without a flag: https://nodejs.org/api/esm.html#importmetaresolvespecifier.
 * This is 20.6.0+, so some time after April 2026.
 */
import { ResolverFactory } from 'oxc-resolver'

// Create a resolver instance with default Node.js resolution settings
const resolver = new ResolverFactory({
  // Use standard Node.js module resolution
  mainFields: ['main'],
  conditionNames: ['node', 'require'],
  extensions: ['.js', '.json', '.node'],
})

type ResolveSuccess = { path: string; error?: never }
type ResolveFailure = { path?: never; error: string }
type ResolveResult = ResolveSuccess | ResolveFailure

// Resolves a module path. Returns an error if the package cannot be found.
export const tryResolvePath = async function (path: string, basedir: string): Promise<ResolveResult> {
  const result = await resolver.async(basedir, path)

  if (result.error || !result.path) {
    return { error: result.error ?? `Cannot resolve '${path}' from '${basedir}'` }
  }

  return { path: result.path }
}

// Resolves a module path. Throws if the package cannot be found.
export const resolvePath = async function (path: string, basedir: string): Promise<string> {
  const result = await resolver.async(basedir, path)

  if (result.error || !result.path) {
    throw new Error(result.error ?? `Cannot resolve '${path}' from '${basedir}'`)
  }

  return result.path
}
