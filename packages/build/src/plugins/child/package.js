const readPkgUp = require('read-pkg-up')

// Retrieve plugin's `package.json`
const getPackageJson = async function({ pluginPath, package }) {
  if (isLocalPath(package)) {
    return {}
  }

  const packageObj = await readPkgUp({ cwd: pluginPath })

  if (packageObj === undefined) {
    return {}
  }

  return packageObj.packageJson
}

// Local plugins most likely don't have their own `package.json`, so this would
// show the project's `package.json` instead
const isLocalPath = function(package) {
  return package.startsWith('.') || package.startsWith('/')
}

module.exports = { getPackageJson }
