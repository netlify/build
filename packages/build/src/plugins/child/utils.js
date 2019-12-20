const { promisify } = require('util')

const resolve = require('resolve')

const pResolve = promisify(resolve)

// Retrieve the `utils` argument. We enforce plugins to explicitly install
// core utilities so that they are versioned. However if they are installed, we
// automatically require them and pass them as `utils` argument for convenience.
const getUtils = async function({ pluginPath, constants, logic: { name } }) {
  const utils = await Promise.all(
    UTILS.map(({ varName, packageName, dynamic }) =>
      getUtil({ varName, packageName, dynamic, pluginPath, constants, name }),
    ),
  )
  return Object.assign({}, ...utils)
}

// Hardcoded list of core utilities
const UTILS = [
  { varName: 'git', packageName: '@netlify/git-utils', dynamic: true },
  { varName: 'cache', packageName: '@netlify/cache-utils' },
  { varName: 'run', packageName: '@netlify/run-utils' },
  { varName: 'functions', packageName: '@netlify/functions-utils', dynamic: true },
]

const getUtil = async function({ varName, packageName, dynamic, pluginPath, constants, name }) {
  const utilPath = await getUtilPath(packageName, pluginPath)
  if (utilPath === undefined) {
    return {}
  }

  const util = await resolveUtil({ utilPath, varName, dynamic, constants, name })
  return { [varName]: util }
}

const getUtilPath = async function(packageName, pluginPath) {
  try {
    return await pResolve(packageName, { basedir: pluginPath })
    // If the package was not installed, return nothing silently
  } catch (error) {
    return
  }
}

const resolveUtil = async function({ utilPath, varName, dynamic, constants, name }) {
  try {
    const util = require(utilPath)
    const utilA = dynamic ? util({ constants, name }) : util
    const utilB = await utilA
    return utilB
  } catch (error) {
    throw new Error(`Could not load core utility '${varName}': ${error.stack}`)
  }
}

module.exports = { getUtils }
