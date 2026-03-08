import originalGlob from 'fast-glob'
import { minimatch as minimatchFunction, type MinimatchOptions } from 'minimatch'
import { normalizePath } from '@archiver/compress-commons/util'

/**
 * Both glob and minimatch only support unix style slashes in patterns
 * For this reason we wrap them and ensure all patterns are always unixified
 * We use `normalize-path` here instead of `unixify` because we do not want to remove drive letters
 */
export const glob = function (pattern: string, options: originalGlob.Options): Promise<string[]> {
  const normalizedIgnore = options.ignore?.map((expression) => normalizePath(expression, false))
  return originalGlob(normalizePath(pattern, false), { ...options, ignore: normalizedIgnore })
}

export const minimatch = function (target: string, pattern: string, options?: MinimatchOptions): boolean {
  return minimatchFunction(target, normalizePath(pattern, false), options)
}
