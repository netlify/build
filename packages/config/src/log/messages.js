'use strict'

const { extractFunctionsDirectory } = require('../functions_config')

const { log } = require('./logger')

const warnLegacyFunctionsDirectory = ({ config = {}, logs }) => {
  const { build = {}, functions = {} } = config
  const { directory } = extractFunctionsDirectory(functions)

  if (build.functions === undefined || directory !== undefined) {
    return
  }

  log(
    logs,
    `Detected functions directory configuration in netlify.toml under [build] settings.
We recommend updating netlify.toml to set the functions directory under [functions] settings using the directory property. For example,

[functions]
  directory = "${build.functions}"`,
  )
}

module.exports = { warnLegacyFunctionsDirectory }
