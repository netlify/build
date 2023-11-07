import Ajv from 'ajv'
import semver from 'semver'

import type { FrameworkDefinition } from './types.js'

const MIN_NODE_VERSION_KEYWORD = {
  keyword: 'minNodeVersion',
  validate: (minNodeVersion: string, { nodeVersion }: { nodeVersion: string }) =>
    semver.valid(minNodeVersion) && semver.valid(nodeVersion) && semver.gte(nodeVersion, minNodeVersion),
}

const MIN_FRAMEWORK_VERSION_KEYWORD = {
  keyword: 'minFrameworkVersion',
  validate: (minFrameworkVersion: string, { frameworkVersion }: { frameworkVersion?: string }) => {
    if (!frameworkVersion) return true

    return (
      semver.valid(minFrameworkVersion) &&
      semver.valid(frameworkVersion) &&
      semver.gte(frameworkVersion, minFrameworkVersion)
    )
  },
}

// https://github.com/ajv-validator/ajv/issues/2132
// @ts-expect-error Ajv types do not work with moduleResolution:nodenext
const ajv = new Ajv({})
ajv.addKeyword(MIN_NODE_VERSION_KEYWORD)
ajv.addKeyword(MIN_FRAMEWORK_VERSION_KEYWORD)

export const getPlugins = function (
  plugins: FrameworkDefinition['plugins'],
  { nodeVersion, frameworkVersion }: { nodeVersion: string; frameworkVersion?: string },
) {
  return plugins
    .filter(({ condition }) => ajv.validate(condition, { nodeVersion, frameworkVersion }))
    .map(({ packageName }) => packageName)
}
