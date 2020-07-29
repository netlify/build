const filterObj = require('filter-obj')
const isPlainObj = require('is-plain-obj')
const readPkgUp = require('read-pkg-up')

// Find the `package.json` (if there is one) and loads its
// `dependencies|devDependencies` and `scripts` fields
const getPackageJsonContent = async function({ projectDir, ignoredCommand }) {
  const { packageJson, packageJsonPath } = await getPackageJson(projectDir)
  if (packageJson === undefined) {
    return { packageJsonPath, npmDependencies: [], scripts: {} }
  }

  const npmDependencies = getNpmDependencies(packageJson)
  const scripts = getScripts(packageJson, ignoredCommand)
  return { packageJsonPath, npmDependencies, scripts }
}

const getPackageJson = async function(projectDir) {
  try {
    const result = await readPkgUp({ cwd: projectDir, normalize: false })
    if (result === undefined) {
      return {}
    }

    const { packageJson, path: packageJsonPath } = result

    if (!isPlainObj(packageJson)) {
      return { packageJsonPath }
    }

    return { packageJson, packageJsonPath }
  } catch (error) {
    return {}
  }
}

// Retrieve `package.json` `dependencies` and `devDependencies` names
const getNpmDependencies = function({ dependencies, devDependencies }) {
  return [...getObjectKeys(dependencies), ...getObjectKeys(devDependencies)]
}

const getObjectKeys = function(value) {
  if (!isPlainObj(value)) {
    return []
  }

  return Object.keys(value)
}

// Retrieve `package.json` `scripts`
const getScripts = function({ scripts }, ignoredCommand) {
  if (!isPlainObj(scripts)) {
    return {}
  }

  const scriptsA = filterObj(scripts, isValidScript)
  const scriptsB = removeIgnoredCommand(scriptsA, ignoredCommand)
  return scriptsB
}

const isValidScript = function(key, value) {
  return typeof value === 'string'
}

// Exclude any script that includes `ignoredCommand`
const removeIgnoredCommand = function(scripts, ignoredCommand) {
  if (ignoredCommand === undefined) {
    return scripts
  }

  return filterObj(scripts, (key, value) => !value.includes(ignoredCommand))
}

module.exports = { getPackageJsonContent }
