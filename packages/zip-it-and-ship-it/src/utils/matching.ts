import { glob as originalGlob, type GlobOptions } from 'glob'
import { minimatch as minimatchFunction, type MinimatchOptions } from 'minimatch'
import normalizePath from 'normalize-path'

// We don't use this. Specifying that we don't makes typing easier, since otherwise `glob` returns
// either `string[]` or `Path[]` depending on this passed option.
type Options = Omit<GlobOptions, 'withFileTypes'>

/**
 * Both glob and minimatch only support unix style slashes in patterns
 * For this reason we wrap them and ensure all patterns are always unixified
 * We use `normalize-path` here instead of `unixify` because we do not want to remove drive letters
 */
export const glob = function (pattern: string, options: Options): Promise<string[]> {
  let normalizedIgnore: string | undefined

  if (options.ignore) {
    if (typeof options.ignore === 'string') {
      normalizedIgnore = normalizePath(options.ignore)
    } else if (Array.isArray(options.ignore)) {
      options.ignore.map((expression) => normalizePath(expression))
    } else {
      throw new Error('Custom glob ignore is not supported')
    }
  }

  return originalGlob(normalizePath(pattern), { ...options, ignore: normalizedIgnore })
}

export const minimatch = function (target: string, pattern: string, options?: MinimatchOptions): boolean {
  return minimatchFunction(target, normalizePath(pattern), options)
}
