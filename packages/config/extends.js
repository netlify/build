const { dirname } = require('path')

const deepmerge = require('deepmerge')

// Allow extending configuration with the `extends` property.
// This also allows plugin presets.
const parseExtends = async function({
  config: { extends: subConfigs, ...config },
  configPath,
  context,
  resolveConfig,
}) {
  if (subConfigs === undefined) {
    return config
  }

  const subConfigsA = Array.isArray(subConfigs) ? subConfigs : [subConfigs]

  if (subConfigsA.length === 0) {
    return config
  }

  const cwd = dirname(configPath)
  const subConfigsB = await Promise.all(subConfigsA.map(subConfig => resolveConfig(subConfig, { cwd, context })))
  const configA = subConfigsB.reduce(mergeConfigs, config)
  return configA
}

const mergeConfigs = function(config, subConfig) {
  return deepmerge(subConfig, config)
}

module.exports = { parseExtends }
