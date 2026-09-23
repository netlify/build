import { resolvePath } from './files.js'
import type { NormalizedNetlifyConfig, PartialNetlifyConfig } from './types/config.js'
import { spreadValue } from './utils/object.js'
import type { RawConfig } from './validate/validations.js'

type InitialBaseOptions = {
  repositoryRoot: string
  defaultConfig: PartialNetlifyConfig
  inlineConfig: RawConfig
}

/** The base directory used to find the configuration file the first time: from `inlineConfig`, else `defaultConfig`. */
export const getInitialBase = function ({ repositoryRoot, defaultConfig, inlineConfig }: InitialBaseOptions) {
  // Not validated yet: a base that isn't a string is reported once the sources are merged.
  const { base: inlineBase } = spreadValue(inlineConfig['build'])
  // Not `??`: a `null` inline base must not fall back to `defaultConfig`.
  if (inlineBase === undefined) {
    return resolveBase(repositoryRoot, getStringBase(defaultConfig))
  }
  return resolveBase(repositoryRoot, typeof inlineBase === 'string' ? inlineBase : undefined)
}

const getStringBase = function (config: RawConfig): string | undefined {
  const { base } = spreadValue(config['build'])
  return typeof base === 'string' ? base : undefined
}

/**
 * The final base directory: the given one, else `build.base` from the configuration. It is used
 * as the build directory and to resolve paths, and it may hold a second configuration file that
 * replaces the first. A `build.base` in that second file is ignored: this doesn't recurse.
 */
export const getBase = function (base: string | undefined, repositoryRoot: string, config: NormalizedNetlifyConfig) {
  return base ?? resolveBase(repositoryRoot, config.build.base)
}

const resolveBase = function (repositoryRoot: string, base: string | undefined) {
  return resolvePath(repositoryRoot, repositoryRoot, base, 'build.base')
}

export const addBase = function (config: NormalizedNetlifyConfig, base: string | undefined): NormalizedNetlifyConfig {
  return { ...config, build: { ...config.build, base } }
}
