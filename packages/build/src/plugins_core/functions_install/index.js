'use strict'

const pathExists = require('path-exists')

const { installFunctionDependencies } = require('../../install/functions')

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
const onPreBuild = async function ({ constants: { FUNCTIONS_SRC, IS_LOCAL } }) {
  if (!(await pathExists(FUNCTIONS_SRC))) {
    return
  }

  await installFunctionDependencies(FUNCTIONS_SRC, IS_LOCAL)
}

module.exports = { onPreBuild }
