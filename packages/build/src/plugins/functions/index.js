const { tmpdir } = require('os')
const { resolve, dirname } = require('path')
const {
  env: { DEPLOY_ID },
} = require('process')

const pathExists = require('path-exists')
const fastGlob = require('fast-glob')
const readdirp = require('readdirp')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const isNetlifyCI = require('../../utils/is-netlify-ci')
const { installDependencies } = require('../../utils/install')

// Plugin to bundle Netlify functions with @netlify/zip-it-and-ship-it
const functionsPlugin = function(pluginConfig, { build: { functions: srcDir } }) {
  if (srcDir === undefined) {
    return { name: NAME }
  }

  return { name: NAME, init, install, functionsBuild }
}

const NAME = '@netlify/plugin-functions-core'

// Validate plugin configuration at startup
const init = async function({
  config: {
    build: { functions: srcDir },
  },
}) {
  if (!(await pathExists(srcDir))) {
    throw new Error(`Functions directory "${resolve(srcDir)}" not found`)
  }
}

// Install Netlify functions dependencies
const install = async function({
  config: {
    build: { functions: srcDir },
  },
}) {
  const packagePaths = await fastGlob([`${srcDir}/**/package.json`, `!${srcDir}/**/node_modules`], {
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
const functionsBuild = async function({
  config: {
    build: { functions: srcDir },
  },
}) {
  const destDir = getDestDir()

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
