// Find all ${pluginId.outputs.varPath} in the `pluginConfig`
const getInputs = function(object) {
  const inputs = Object.values(object).map(getInput)
  return [].concat(...inputs)
}

const getInput = function(value) {
  if (typeof value === 'object' && value !== null) {
    return getInputs(value)
  }

  if (typeof value !== 'string') {
    return []
  }

  const result = INPUT_REGEXP.exec(value)
  if (result === null) {
    return []
  }

  const [, pluginId, varPath] = result
  return [{ pluginId, varPath }]
}

const INPUT_REGEXP = /^\$\{\{outputs:([^.{}]+)\.([^}]+)\}\}$/u

module.exports = { getInputs }
