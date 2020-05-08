const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const pathExists = require('path-exists')
const readdirp = require('readdirp')

const { serializeArray } = require('../../log/serialize')

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
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
${serializeArray(paths)}`)
}

const getLoggedPath = function({ path }) {
  return path
}

module.exports = { onPostBuild }
