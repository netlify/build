import { throwUserError } from '../error.js'
import { EVENTS } from '../events.js'
import { FUNCTION_CONFIG_PROPERTIES, WILDCARD_ALL } from '../functions_config.js'
import type { PartialNetlifyConfig } from '../types/config.js'
import type { ConfigMutation } from '../types/mutations.js'
import { setProp } from '../utils/set.js'

import { getPropName } from './config_prop_name.js'

type Denormalize = (
  inlineConfig: PartialNetlifyConfig,
  value: unknown,
  keys: ConfigMutation['keys'],
) => PartialNetlifyConfig

type MutableProp = {
  /** The last build event during which the property may change. */
  lastEvent: string
  /** How to write the change, if not as is. */
  denormalize?: Denormalize
}

/**
 * Apply config mutations to `inlineConfig`. Mutations are made on the normalized config, so this
 * also reverts that normalization where needed, so the result can be written back to `netlify.toml`.
 */
export const applyMutations = function (
  inlineConfig: PartialNetlifyConfig,
  configMutations: ConfigMutation[],
): PartialNetlifyConfig {
  return configMutations.reduce(applyMutation, inlineConfig)
}

const applyMutation = function (inlineConfig: PartialNetlifyConfig, { keys, value, event }: ConfigMutation) {
  const propName = getPropName(keys)
  const mutableProp = Object.hasOwn(MUTABLE_PROPS, propName) ? MUTABLE_PROPS[propName] : undefined
  if (mutableProp === undefined) {
    throwUserError(`"netlifyConfig.${propName}" is read-only.`)
  }

  const { lastEvent, denormalize } = mutableProp
  // Dev events aren't in EVENTS (index -1): nothing is rejected during a dev event, and dev-only
  // properties are rejected during any build event.
  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwUserError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }

  return denormalize === undefined
    ? (setProp(inlineConfig, keys, value) as PartialNetlifyConfig)
    : denormalize(inlineConfig, value, keys)
}

// `functions['*'].*` takes priority over top-level `functions.*` properties, so a mutation of a
// top-level one is written to `functions['*']`.
const denormalizeFunctionsTopProps: Denormalize = function ({ functions = {}, ...inlineConfig }, value, [, key]) {
  const { [WILDCARD_ALL]: wildcardProps } = functions as Record<string, Record<string, unknown> | undefined>
  return FUNCTION_CONFIG_PROPERTIES.has(String(key))
    ? { ...inlineConfig, functions: { ...functions, [WILDCARD_ALL]: { ...wildcardProps, [String(key)]: value } } }
    : { ...inlineConfig, functions: { ...functions, [String(key)]: value } }
}

/** Properties that may change, and until which event. Every other property is read-only. */
const MUTABLE_PROPS: Partial<Record<string, MutableProp>> = {
  'build.command': { lastEvent: 'onPreBuild' },
  'build.edge_functions': { lastEvent: 'onPostBuild' },
  'build.environment': { lastEvent: 'onPostBuild' },
  'build.environment.*': { lastEvent: 'onPostBuild' },
  'build.functions': { lastEvent: 'onBuild' },
  'build.processing': { lastEvent: 'onPostBuild' },
  'build.processing.css': { lastEvent: 'onPostBuild' },
  'build.processing.css.bundle': { lastEvent: 'onPostBuild' },
  'build.processing.css.minify': { lastEvent: 'onPostBuild' },
  'build.processing.html': { lastEvent: 'onPostBuild' },
  'build.processing.html.pretty_urls': { lastEvent: 'onPostBuild' },
  'build.processing.images': { lastEvent: 'onPostBuild' },
  'build.processing.images.compress': { lastEvent: 'onPostBuild' },
  'build.processing.js': { lastEvent: 'onPostBuild' },
  'build.processing.js.bundle': { lastEvent: 'onPostBuild' },
  'build.processing.js.minify': { lastEvent: 'onPostBuild' },
  'build.processing.skip_processing': { lastEvent: 'onPostBuild' },
  'build.publish': { lastEvent: 'onPostBuild' },
  'build.services': { lastEvent: 'onPostBuild' },
  'build.services.*': { lastEvent: 'onPostBuild' },
  edge_functions: { lastEvent: 'onPostBuild' },
  'functions.*': { lastEvent: 'onBuild', denormalize: denormalizeFunctionsTopProps },
  'functions.*.*': { lastEvent: 'onBuild' },
  headers: { lastEvent: 'onPostBuild' },
  images: { lastEvent: 'onPostBuild' },
  'images.remote_images': { lastEvent: 'onPostBuild' },
  redirects: { lastEvent: 'onPostBuild' },
  spa_fallback: { lastEvent: 'onPostBuild' },
  dev: { lastEvent: 'onPreDev' },
  'dev.processing': { lastEvent: 'onPreDev' },
  'dev.processing.html': { lastEvent: 'onPreDev' },
  'dev.processing.html.injections': { lastEvent: 'onPreDev' },
}
