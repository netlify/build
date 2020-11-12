'use strict'

const { resolve, relative } = require('path')

const { zipFunctions, listFunctions } = require('@netlify/zip-it-and-ship-it')
const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { log } = require('../../log/logger')
const { logFunctionsToBundle } = require('../../log/messages/plugins')

const { getZipError } = require('./error')

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const onBuild = async function ({
  constants: { FUNCTIONS_SRC, FUNCTIONS_DIST, BUILD_DIR = '.' },
  utils: {
    build: { failBuild },
    logs,
  },
}) {
  const functionsSrc = resolve(BUILD_DIR, FUNCTIONS_SRC)
  const functionsDist = resolve(BUILD_DIR, FUNCTIONS_DIST)

  if (!(await pathExists(functionsSrc))) {
    // TODO: use `utils.build.warn()` when available
    // See https://github.com/netlify/build/issues/1248
    log(logs, `The Netlify Functions setting targets a non-exiting directory: ${FUNCTIONS_SRC}`)
    return
  }

  if (!(await isDirectory(functionsSrc))) {
    failBuild(`The Netlify Functions setting should target a directory, not a regular file: ${FUNCTIONS_SRC}`)
  }

  const functions = await getFunctionPaths(functionsSrc)
  logFunctionsToBundle({ functions, FUNCTIONS_SRC, logs })

  if (functions.length === 0) {
    return
  }

  try {
    await zipFunctions(functionsSrc, functionsDist)
  } catch (error) {
    throw await getZipError(error, functionsSrc)
  }
}

const getFunctionPaths = async function (functionsSrc) {
  const functions = await listFunctions(functionsSrc)
  return functions.map(({ mainFile }) => relative(functionsSrc, mainFile))
}

module.exports = { onBuild }
