import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'
import rfdc from 'rfdc'

const clone = rfdc()

export type ConfigMutation = {
  keys: string[]
  keysString: string
  value: unknown
  event: string
}

// Copy `netlifyConfig` so we can compare before/after mutating it
export function cloneNetlifyConfig<T>(netlifyConfig: T): T {
  return clone(netlifyConfig)
}

// Diff `netlifyConfig` before and after mutating it to retrieve an array of
// `configMutations` objects.
// We need to keep track of the changes on `netlifyConfig` so they can be
// processed later to:
//  - Warn plugin authors when mutating read-only properties
//  - Apply the change to `netlifyConfig` in the parent process so it can
//    run `@netlify/config` to normalize and validate the new values
// `configMutations` is passed to parent process as JSON

export function getConfigMutations(
  netlifyConfig: object,
  netlifyConfigCopy: object,
  event: string
): ConfigMutation[] {
  const configMutations = diffObjects(
    netlifyConfig as Record<string, unknown>,
    netlifyConfigCopy as Record<string, unknown>,
    [],
  )

  return configMutations.map((configMutation) => getConfigMutation(configMutation, event))
}

type DiffResult = { keys: string[]; value: unknown }

// We only recurse over plain objects, not arrays. Which means array properties
// can only be modified all at once.

function diffObjects(
  objA: Record<string, unknown>,
  objB: Record<string, unknown>,
  parentKeys: string[],
): DiffResult[] {
  const allKeys = [...new Set([...Object.keys(objA), ...Object.keys(objB)])]

  return allKeys.flatMap((key) => {
    const valueA = objA[key]
    const valueB = objB[key]
    const keys = [...parentKeys, key]

    if (isPlainObj(valueA) && isPlainObj(valueB)) {
      return diffObjects(valueA as Record<string, unknown>, valueB as Record<string, unknown>, keys)
    }

    if (isDeepStrictEqual(valueA, valueB)) {
      return []
    }

    return [{ keys, value: valueB }]
  })
}

function getConfigMutation({ keys, value }: DiffResult, event: string): ConfigMutation {
  const serializedKeys = keys.map(String)

  return {
    keys: serializedKeys,
    keysString: serializedKeys.join('.'),
    value,
    event,
  }
}
