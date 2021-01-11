'use strict'

const { env } = require('process')

const filterObj = require('filter-obj')

const { getParentColorEnv } = require('../log/colors')

// Retrieve the environment variables passed to plugins and `build.command`
// When run locally, this tries to emulate the production environment.
const getChildEnv = function ({ envOpt, env: allConfigEnv }) {
  const parentColorEnv = getParentColorEnv()
  const parentEnv = { ...env, ...allConfigEnv, ...envOpt, ...parentColorEnv }
  return filterObj(parentEnv, shouldKeepEnv)
}

const shouldKeepEnv = function (key) {
  return !REMOVED_PARENT_ENV.has(key.toLowerCase())
}

const REMOVED_PARENT_ENV = new Set(['bugsnag_key'])

module.exports = { getChildEnv }
