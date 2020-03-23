const { dirname } = require('path')

const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const readdirp = require('readdirp')
const pathExists = require('path-exists')

const { installDependencies } = require('../../utils/install')
const { serializeList } = require('../../utils/list')

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const functionsPlugins = function(inputs, { constants: { FUNCTIONS_SRC } }) {
  // When `config.build.functions` is not defined, it means users does not use
  // Netlify Functions. However when it is defined but points to a non-existing
  // directory, this might mean the directory is created later one, so we cannot
  // do that check yet.
  if (FUNCTIONS_SRC === undefined) {
    return {}
  }

  return { onPreBuild, onPostBuild }
}

const onPreBuild = async function({ constants: { FUNCTIONS_SRC } }) {
  if (!(await pathExists(FUNCTIONS_SRC))) {
    return
  }

  const packagePaths = await readdirp.promise(FUNCTIONS_SRC, { depth: 1, fileFilter: 'package.json' })
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

// Package Netlify functions
const onPostBuild = async function({ constants: { FUNCTIONS_SRC, FUNCTIONS_DIST } }) {
  if (!(await pathExists(FUNCTIONS_SRC))) {
    return
  }

  console.log(`Packaging functions from ${FUNCTIONS_SRC}`)
  await zipFunctions(FUNCTIONS_SRC, FUNCTIONS_DIST)

  await logResults(FUNCTIONS_DIST)
}

// Print the list of paths to the packaged functions
const logResults = async function(FUNCTIONS_DIST) {
  const files = await readdirp.promise(FUNCTIONS_DIST)

  if (files.length === 0) {
    console.log('No functions were packaged')
    return
  }

  const paths = files.map(getLoggedPath)
  console.log(`Functions packaged in ${FUNCTIONS_DIST}
${serializeList(paths)}`)
}

const getLoggedPath = function({ path }) {
  return path
}

module.exports = functionsPlugins
