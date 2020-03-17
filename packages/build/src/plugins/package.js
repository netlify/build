const { dirname } = require('path')

const readPkgUp = require('read-pkg-up')

// Retrieve plugin's `package.json`
const getPackageJson = async function({ pluginDir, local }) {
  const packageObj = await readPkgUp({ cwd: pluginDir })
  if (packageObj === undefined) {
    return { packageJson: {} }
  }

  const { path, packageJson } = packageObj
  const packageDir = dirname(path)
  // Local plugins most likely don't have their own `package.json`, so this would
  // show the project's `package.json` instead
  if (local) {
    return { packageDir, packageJson: {} }
  }

  return { packageDir, packageJson }
}

module.exports = { getPackageJson }
