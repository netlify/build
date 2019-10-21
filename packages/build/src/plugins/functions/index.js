const { tmpdir } = require('os')
const { resolve } = require('path')
const {
  env: { DEPLOY_ID }
} = require('process')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const readdirp = require('readdirp')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const isNetlifyCI = require('../../utils/is-netlify-ci')

// Plugin to bundle Netlify functions with @netlify/zip-it-and-ship-it
const functionsPlugin = function(pluginConfig, { build: { functions: srcDir } }) {
  if (srcDir === undefined) {
    return {}
  }

  return { init, functionsBuild }
}

// Validate plugin configuration at startup
const init = async function({
  config: {
    build: { functions: srcDir }
  }
}) {
  if (!(await pathExists(srcDir))) {
    throw new Error(`Functions directory "${resolve(srcDir)}" not found`)
  }
}

// Bundle Netlify functions
const functionsBuild = async function({
  config: {
    build: { functions: srcDir }
  }
}) {
  const destDir = getDestDir()

  // TODO: remove this after https://github.com/netlify/zip-it-and-ship-it/pull/48 is merged
  // since that PR allows `destDir` not to exist
  if (!(await pathExists(destDir))) {
    await makeDir(destDir)
  }

  console.log('Zipping functions')
  await zipFunctions(srcDir, destDir)

  await logResults(destDir)
}

// Retrieve directory where bundled functions will be
const getDestDir = function() {
  if (isNetlifyCI()) {
    return `${tmpdir()}/zisi-${DEPLOY_ID}`
  }

  return '.netlify/functions'
}

// Print the list of paths to the bundled functions
const logResults = async function(destDir) {
  const paths = await getLoggedPaths(destDir)
  console.log(`Functions bundled in "${resolve(destDir)}":`)
  console.log(paths)
}

const getLoggedPaths = async function(destDir) {
  const files = await readdirp.promise(destDir)
  const paths = files.map(getLoggedPath).join('\n')
  return paths
}

const getLoggedPath = function({ path }) {
  return ` - ${path}`
}

module.exports = functionsPlugin
