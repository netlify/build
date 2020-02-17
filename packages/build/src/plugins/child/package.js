const readPkgUp = require('read-pkg-up')

// Retrieve plugin's `package.json`
const getPackageJson = async function({ pluginPath, local }) {
  // Local plugins most likely don't have their own `package.json`, so this would
  // show the project's `package.json` instead
  if (local) {
    return {}
  }

  const packageObj = await readPkgUp({ cwd: pluginPath })

  if (packageObj === undefined) {
    return {}
  }

  return packageObj.packageJson
}

module.exports = { getPackageJson }
