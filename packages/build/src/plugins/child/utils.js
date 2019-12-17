const { promisify } = require('util')

const resolve = require('resolve')

const pResolve = promisify(resolve)

// Retrieve the `utils` argument. We enforce plugins to explicitly install
// core utilities so that they are versioned. However if they are installed, we
// automatically require them and pass them as `utils` argument for convenience.
const getUtils = async function(pluginPath) {
  const utils = await Promise.all(UTILS.map(({ varName, packageName }) => getUtil(varName, packageName, pluginPath)))
  return Object.assign({}, ...utils)
}

// Hardcoded list of core utilities
// TODO: remove `test` once we have at least one utility. This is used for
// testing at the moment.
const UTILS = [{ varName: 'test', packageName: '@netlify/utils-test' }]

const getUtil = async function(varName, packageName, pluginPath) {
  const utilPath = await getUtilPath(packageName, pluginPath)
  if (utilPath === undefined) {
    return {}
  }

  const util = await resolveUtil(utilPath, varName)
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

const resolveUtil = async function(utilPath, varName) {
  try {
    const util = require(utilPath)
    const utilA = typeof util === 'function' ? util() : util
    const utilB = await utilA
    return utilB
  } catch (error) {
    throw new Error(`Could not load core utility '${varName}': ${error.stack}`)
  }
}

module.exports = { getUtils }
