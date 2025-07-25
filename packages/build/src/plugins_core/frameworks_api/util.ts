import { promises as fs } from 'fs'
import { resolve } from 'path'

import isPlainObject from 'is-plain-obj'

import type { NetlifyConfig } from '../../index.js'
import { FRAMEWORKS_API_CONFIG_ENDPOINT } from '../../utils/frameworks_api.js'
import { SystemLogger } from '../types.js'

export const loadConfigFile = async (buildDir: string, packagePath?: string) => {
  const configPath = resolve(buildDir, packagePath ?? '', FRAMEWORKS_API_CONFIG_ENDPOINT)

  try {
    const data = await fs.readFile(configPath, 'utf8')

    return JSON.parse(data) as Partial<NetlifyConfig>
  } catch (err) {
    // If the file doesn't exist, this is a non-error.
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  // The first version of this API was called "Deploy Configuration API" and it
  // had `.netlify/deploy` as its base directory. For backwards-compatibility,
  // we need to support that path for the config file.
  const legacyConfigPath = resolve(buildDir, packagePath ?? '', '.netlify/deploy/v1/config.json')

  try {
    const data = await fs.readFile(legacyConfigPath, 'utf8')

    return JSON.parse(data) as Partial<NetlifyConfig>
  } catch (err) {
    // If the file doesn't exist, this is a non-error.
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

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
  Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]): [string, unknown] | null => {
        const keyPath = [...path, key]

        if (!isAllowedProperty(keyPath, allowedProperties)) {
          systemLog(`Discarding property that is not supported by the Deploy Configuration API: ${keyPath.join('.')}`)

          return null
        }

        if (!isPlainObject(value)) {
          systemLog(`Loading property from Deploy Configuration API: ${keyPath.join('.')}`)

          return [key, value]
        }

        return [key, filterConfig(value, keyPath, allowedProperties, systemLog)]
      })
      .filter((pair) => pair !== null),
  )
