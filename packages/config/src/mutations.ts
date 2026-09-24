import isPlainObj from 'is-plain-obj'

import { throwUserError } from './error.js'
import { FUNCTION_CONFIG_PROPERTIES, WILDCARD_ALL } from './normalize.js'
import { spreadValue } from './normalize_values.js'
import type { ConfigMutation, RawConfig } from './types.js'

/** The build events, in order. Mutation cut-offs compare positions in this list. */
export const EVENTS = ['onPreBuild', 'onBuild', 'onPostBuild', 'onSuccess', 'onError', 'onEnd']

export const DEV_EVENTS = ['onPreDev', 'onDev']

type Key = ConfigMutation['keys'][number]

/** The properties that may change, and the last event during which they may. Every other property is read-only. */
const MUTABLE_PROPS = new Map<string, string>([
  ['build.command', 'onPreBuild'],
  ['build.functions', 'onBuild'],
  ['functions.*', 'onBuild'],
  ['functions.*.*', 'onBuild'],
  ['build.edge_functions', 'onPostBuild'],
  ['build.environment', 'onPostBuild'],
  ['build.environment.*', 'onPostBuild'],
  ['build.processing', 'onPostBuild'],
  ['build.processing.css', 'onPostBuild'],
  ['build.processing.css.bundle', 'onPostBuild'],
  ['build.processing.css.minify', 'onPostBuild'],
  ['build.processing.html', 'onPostBuild'],
  ['build.processing.html.pretty_urls', 'onPostBuild'],
  ['build.processing.images', 'onPostBuild'],
  ['build.processing.images.compress', 'onPostBuild'],
  ['build.processing.js', 'onPostBuild'],
  ['build.processing.js.bundle', 'onPostBuild'],
  ['build.processing.js.minify', 'onPostBuild'],
  ['build.processing.skip_processing', 'onPostBuild'],
  ['build.publish', 'onPostBuild'],
  ['build.services', 'onPostBuild'],
  ['build.services.*', 'onPostBuild'],
  ['edge_functions', 'onPostBuild'],
  ['headers', 'onPostBuild'],
  ['images', 'onPostBuild'],
  ['images.remote_images', 'onPostBuild'],
  ['redirects', 'onPostBuild'],
  ['spa_fallback', 'onPostBuild'],
  ['dev', 'onPreDev'],
  ['dev.processing', 'onPreDev'],
  ['dev.processing.html', 'onPreDev'],
  ['dev.processing.html.injections', 'onPreDev'],
])

/** Properties whose children are named by the user, so any child name is `*`. */
const DYNAMIC_OBJECT_PROPS = new Set(['build.services', 'build.environment', 'functions', 'functions.*'])

/**
 * Apply mutations in order, without changing the argument. A mutation of a read-only property, or
 * made after the property's last event, is a user error.
 */
export const applyMutations = function (config: object, mutations: readonly ConfigMutation[]): RawConfig {
  // Sound: any object's properties read as `unknown`. Interface types only lack the index signature.
  return mutations.reduce(applyMutation, config as RawConfig)
}

const applyMutation = function (config: RawConfig, { keys, value, event }: ConfigMutation): RawConfig {
  const propName = getPropName(keys)
  const lastEvent = MUTABLE_PROPS.get(propName)
  if (lastEvent === undefined) {
    throwUserError(`"netlifyConfig.${propName}" is read-only.`)
  }

  // Dev events and unknown ones are not in `EVENTS`, so they never cut a mutation off (SPEC §15.4).
  if (EVENTS.indexOf(lastEvent) < EVENTS.indexOf(event)) {
    throwUserError(`"netlifyConfig.${propName}" cannot be modified after "${lastEvent}".`)
  }

  // Mutable property names start with a property name, so `String()` changes nothing.
  return propName === 'functions.*'
    ? setFunctionsTopProp(config, String(keys[1]), value)
    : setObjectProp(config, String(keys[0]), keys.slice(1), value)
}

const getPropName = function (keys: readonly Key[]): string {
  return keys.reduce<string>((propName, key) => {
    const name = String(key)
    const normalizedKey = isIntegerKey(key) || DYNAMIC_OBJECT_PROPS.has(propName) ? '*' : name
    return propName === '' ? normalizedKey : `${propName}.${normalizedKey}`
  }, '')
}

const isIntegerKey = (key: Key): key is number => Number.isInteger(key)

const setProp = function (parent: unknown, keys: readonly Key[], value: unknown): unknown {
  const [key, ...childKeys] = keys
  if (key === undefined) {
    return value
  }

  if (isIntegerKey(key)) {
    const items: unknown[] = Array.isArray(parent) ? parent : []
    const array = [...items, ...new Array<unknown>(Math.max(key - items.length + 1, 0))]
    return [...array.slice(0, key), setProp(array[key], childKeys, value), ...array.slice(key + 1)]
  }

  return setObjectProp(parent, key, childKeys, value)
}

// A parent that isn't a plain object is replaced, as it always has been.
const setObjectProp = function (parent: unknown, key: Key, childKeys: readonly Key[], value: unknown): RawConfig {
  const object = isPlainObj(parent) ? parent : {}
  return { ...object, [key]: setProp(object[key], childKeys, value) }
}

// The configuration is normalized so that `functions['*']` holds the properties for every function,
// which take priority over top-level ones. So a mutation of a top-level one is written there.
const setFunctionsTopProp = function ({ functions, ...config }: RawConfig, key: string, value: unknown): RawConfig {
  const functionsConfig = spreadValue(functions)
  const updatedFunctions = FUNCTION_CONFIG_PROPERTIES.has(key)
    ? { ...functionsConfig, [WILDCARD_ALL]: { ...spreadValue(functionsConfig[WILDCARD_ALL]), [key]: value } }
    : { ...functionsConfig, [key]: value }
  return { ...config, functions: updatedFunctions }
}
