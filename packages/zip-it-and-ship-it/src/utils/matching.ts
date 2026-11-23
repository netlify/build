import { minimatch as minimatchFunction, type MinimatchOptions } from 'minimatch'
import normalizePath from 'normalize-path'
import { glob as originalGlob, type GlobOptions } from 'tinyglobby'

/**
 * Both glob and minimatch only support unix style slashes in patterns
 * For this reason we wrap them and ensure all patterns are always unixified
 * We use `normalize-path` here instead of `unixify` because we do not want to remove drive letters
 */
export const glob = function (pattern: string, options: GlobOptions): Promise<string[]> {
  const ignore: string[] = Array.isArray(options.ignore) ? options.ignore : options.ignore ? [options.ignore] : []
  const normalizedIgnore = ignore.map((expression) => normalizePath(expression))
  return originalGlob(normalizePath(pattern), { ...options, ignore: normalizedIgnore, expandDirectories: false })
}

export const minimatch = function (target: string, pattern: string, options?: MinimatchOptions): boolean {
  return minimatchFunction(target, normalizePath(pattern), options)
}
