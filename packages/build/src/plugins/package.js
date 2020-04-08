const { dirname } = require('path')

const readPkgUp = require('read-pkg-up')

// Retrieve plugin's `package.json`
const getPackageJson = async function({ pluginDir }) {
  const packageObj = await readPkgUp({ cwd: pluginDir })
  if (packageObj === undefined) {
    return { packageJson: {} }
  }

  const { path, packageJson } = packageObj
  const packageDir = dirname(path)
  return { packageDir, packageJson }
}

module.exports = { getPackageJson }
