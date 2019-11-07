const { resolve, dirname } = require('path')

const pathExists = require('path-exists')
const fastGlob = require('fast-glob')
const readdirp = require('readdirp')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const unixify = require('unixify')

const { installDependencies } = require('../../utils/install')

// Plugin to bundle Netlify functions with @netlify/zip-it-and-ship-it
const functionsPlugin = function(pluginConfig, { constants: { FUNCTIONS_SRC } }) {
  if (FUNCTIONS_SRC === undefined) {
    return { name: NAME }
  }

  return { name: NAME, init, install, functionsBuild }
}

const NAME = '@netlify/plugin-functions-core'

// Validate plugin configuration at startup
const init = async function({ constants: { FUNCTIONS_SRC } }) {
  if (!(await pathExists(FUNCTIONS_SRC))) {
    throw new Error(`Functions directory "${FUNCTIONS_SRC}" not found`)
  }
}

// Install Netlify functions dependencies
const install = async function({ constants: { FUNCTIONS_SRC } }) {
  const base = unixify(FUNCTIONS_SRC)
  const packagePaths = await fastGlob([`${base}/**/package.json`, `!${base}/**/node_modules`], {
    onlyFiles: true,
    unique: true,
  })

  if (packagePaths.length === 0) {
    return
  }

  console.log('Installing functions dependencies')

  const packageRoots = packagePaths.map(dirname)

  await Promise.all(packageRoots.map(installDependencies))
}

// Bundle Netlify functions
const functionsBuild = async function({ constants: { FUNCTIONS_SRC, FUNCTIONS_DIST } }) {
  console.log('Zipping functions')
  await zipFunctions(FUNCTIONS_SRC, FUNCTIONS_DIST)

  await logResults(FUNCTIONS_DIST)
}

// Print the list of paths to the bundled functions
const logResults = async function(FUNCTIONS_DIST) {
  const paths = await getLoggedPaths(FUNCTIONS_DIST)
  console.log(`Functions bundled in "${resolve(FUNCTIONS_DIST)}":`)
  console.log(paths)
}

const getLoggedPaths = async function(FUNCTIONS_DIST) {
  const files = await readdirp.promise(FUNCTIONS_DIST)
  const paths = files.map(getLoggedPath).join('\n')
  return paths
}

const getLoggedPath = function({ path }) {
  return ` - ${path}`
}

module.exports = functionsPlugin
