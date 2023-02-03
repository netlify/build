import Ajv from 'ajv'
import semver from 'semver'

import type { FrameworkDefinition } from './types.js'

const MIN_NODE_VERSION_KEYWORD = {
  keyword: 'minNodeVersion',
  validate: (minNodeVersion: string, { nodeVersion }: { nodeVersion: string }) =>
    semver.valid(minNodeVersion) && semver.valid(nodeVersion) && semver.gte(nodeVersion, minNodeVersion),
}

// https://github.com/ajv-validator/ajv/issues/2132
// @ts-expect-error Ajv types do not work with moduleResolution:nodenext
const ajv = new Ajv({})
ajv.addKeyword(MIN_NODE_VERSION_KEYWORD)

export const getPlugins = function (plugins: FrameworkDefinition['plugins'], { nodeVersion }: { nodeVersion: string }) {
  return plugins
    .filter(({ condition }) => ajv.validate(condition, { nodeVersion }))
    .map(({ packageName }) => packageName)
}
