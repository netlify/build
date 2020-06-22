const { dirname } = require('path')

const readPkgUp = require('read-pkg-up')

// Retrieve `package.json` from a specific directory
const getPackageJson = async function(cwd) {
  const packageObj = await readPkgUp({ cwd })
  if (packageObj === undefined) {
    return { packageJson: {} }
  }

  const { path, packageJson } = packageObj
  const packageDir = dirname(path)
  return { packageDir, packageJson }
}

module.exports = { getPackageJson }
