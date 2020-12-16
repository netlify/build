const filterObj = require('filter-obj')
const isPlainObj = require('is-plain-obj')

const getPackageJsonContent = function ({ packageJson }) {
  if (packageJson === undefined) {
    return { npmDependencies: [], scripts: {} }
  }

  const npmDependencies = getNpmDependencies(packageJson)
  const scripts = getScripts(packageJson)
  return { npmDependencies, scripts }
}

// Retrieve `package.json` `dependencies` and `devDependencies` names
const getNpmDependencies = function ({ dependencies, devDependencies }) {
  return [...getObjectKeys(dependencies), ...getObjectKeys(devDependencies)]
}

const getObjectKeys = function (value) {
  if (!isPlainObj(value)) {
    return []
  }

  return Object.keys(value)
}

// Retrieve `package.json` `scripts`
const getScripts = function ({ scripts }) {
  if (!isPlainObj(scripts)) {
    return {}
  }

  const scriptsA = filterObj(scripts, isValidScript)
  return scriptsA
}

const isValidScript = function (key, value) {
  return typeof value === 'string'
}

module.exports = { getPackageJsonContent }
