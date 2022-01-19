import Ajv from 'ajv'
import semver from 'semver'

const MIN_NODE_VERSION_KEYWORD = {
  keyword: 'minNodeVersion',
  validate: (minNodeVersion, { nodeVersion }) =>
    semver.valid(minNodeVersion) && semver.valid(nodeVersion) && semver.gte(nodeVersion, minNodeVersion),
}

const ajv = new Ajv({})
ajv.addKeyword(MIN_NODE_VERSION_KEYWORD)

export const getPlugins = function (plugins, { nodeVersion }) {
  return plugins
    .filter(({ condition }) => ajv.validate(condition, { nodeVersion }))
    .map(({ packageName }) => packageName)
}
