'use strict'

const { relative } = require('path')

const { zipFunctions, listFunctions } = require('@netlify/zip-it-and-ship-it')
const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { logFunctionsToBundle } = require('../../log/messages/plugins')

const { getZipError } = require('./error')

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const onBuild = async function ({
  constants: { FUNCTIONS_SRC, FUNCTIONS_DIST },
  utils: {
    build: { failBuild },
  },
}) {
  if (!(await pathExists(FUNCTIONS_SRC))) {
    // TODO: use `utils.build.warn()` when available
    // See https://github.com/netlify/build/issues/1248
    console.log(`The Netlify Functions setting targets a non-exiting directory: ${FUNCTIONS_SRC}`)
    return
  }

  if (!(await isDirectory(FUNCTIONS_SRC))) {
    failBuild(`The Netlify Functions setting should target a directory, not a regular file: ${FUNCTIONS_SRC}`)
  }

  const functions = await getFunctionPaths(FUNCTIONS_SRC)
  logFunctionsToBundle(functions, FUNCTIONS_SRC)

  if (functions.length === 0) {
    return
  }

  try {
    await zipFunctions(FUNCTIONS_SRC, FUNCTIONS_DIST)
  } catch (error) {
    throw await getZipError(error, FUNCTIONS_SRC)
  }
}

const getFunctionPaths = async function (FUNCTIONS_SRC) {
  const functions = await listFunctions(FUNCTIONS_SRC)
  return functions.map(({ mainFile }) => relative(FUNCTIONS_SRC, mainFile))
}

module.exports = { onBuild }
