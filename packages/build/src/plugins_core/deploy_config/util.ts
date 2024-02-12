import isPlainObject from 'is-plain-obj'
import mapObject, { mapObjectSkip } from 'map-obj'

import { SystemLogger } from '../types.js'

/**
 * Checks whether a property matches a template that may contain wildcards.
 * Both the property and the template use a dot-notation represented as an
 * array of strings.
 * For example, the property `["build", "command"]` matches the templates
 * `["build", "command"]` and `["build", "*"]`, but not `["functions"]`.
 */
const propertyMatchesTemplate = (property: string[], template: string[]) =>
  property.every((node, index) => template[index] === node || template[index] === '*')

/**
 * Checks whether a property can be defined using the Deploy Configuration API.
 */
export const isAllowedProperty = (property: string[], allowedProperties: string[][]) =>
  allowedProperties.some((template) => propertyMatchesTemplate(property, template))

/**
 * Takes a candidate configuration object and returns a normalized version that
 * includes only the properties that are present in an allow-list. It does so
 * recursively, so `allowedProperties` can contain the full list of properties
 * that the Deploy Configuration API can interact with.
 */
export const filterConfig = (
  obj: Record<string, unknown>,
  path: string[],
  allowedProperties: string[][],
  systemLog: SystemLogger,
): Record<string, unknown> =>
  mapObject(obj, (key, value) => {
    const keyPath = [...path, key]

    if (!isAllowedProperty(keyPath, allowedProperties)) {
      return mapObjectSkip
    }

    if (!isPlainObject(value)) {
      return [key, value]
    }

    return [key, filterConfig(value, keyPath, allowedProperties, systemLog)]
  })
