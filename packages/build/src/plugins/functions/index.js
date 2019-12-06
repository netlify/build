const { dirname } = require('path')

const fastGlob = require('fast-glob')
const readdirp = require('readdirp')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const unixify = require('unixify')

const { installDependencies } = require('../../utils/install')
const { serializeList } = require('../../utils/list')

// Plugin to bundle Netlify functions with @netlify/zip-it-and-ship-it
const functionsPlugin = function(pluginConfig, { constants: { FUNCTIONS_SRC } }) {
  if (FUNCTIONS_SRC === undefined) {
    return { name: NAME }
  }

  return { name: NAME, onInstall, onFunctionsBuild }
}

const NAME = '@netlify/plugin-functions-core'

// Install Netlify functions dependencies
const onInstall = async function({ constants: { FUNCTIONS_SRC } }) {
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
const onFunctionsBuild = async function({ constants: { FUNCTIONS_SRC, FUNCTIONS_DIST } }) {
  console.log(`Bundling functions from ${FUNCTIONS_SRC}`)
  await zipFunctions(FUNCTIONS_SRC, FUNCTIONS_DIST)

  await logResults(FUNCTIONS_DIST)
}

// Print the list of paths to the bundled functions
const logResults = async function(FUNCTIONS_DIST) {
  const files = await readdirp.promise(FUNCTIONS_DIST)

  if (files.length === 0) {
    console.log('No functions were bundled')
    return
  }

  const paths = files.map(getLoggedPath)
  console.log(`Functions bundled in ${FUNCTIONS_DIST}
${serializeList(paths)}`)
}

const getLoggedPath = function({ path }) {
  return path
}

module.exports = functionsPlugin
