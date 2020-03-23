const { dirname } = require('path')

const readdirp = require('readdirp')

const { installDependencies } = require('./main')

// Install dependencies of Netlify Functions
const installFunctionDependencies = async function(functionsSrc) {
  const packagePaths = await readdirp.promise(functionsSrc, { depth: 1, fileFilter: 'package.json' })
  if (packagePaths.length === 0) {
    return
  }

  console.log('Installing functions dependencies')
  const packageRoots = packagePaths.map(getPackageRoot)
  await Promise.all(packageRoots.map(packageRoot => installDependencies({ packageRoot })))
}

const getPackageRoot = function({ fullPath }) {
  return dirname(fullPath)
}

module.exports = { installFunctionDependencies }
