import { env } from 'process'

import filterObj from 'filter-obj'

import { getParentColorEnv } from '../log/colors.js'

// Retrieve the environment variables passed to plugins and `build.command`
// When run locally, this tries to emulate the production environment.
export const getChildEnv = function ({ envOpt, env: allConfigEnv }) {
  const parentColorEnv = getParentColorEnv()
  const parentEnv = { ...env, ...allConfigEnv, ...envOpt, ...parentColorEnv }
  return filterObj(parentEnv, shouldKeepEnv)
}

const shouldKeepEnv = function (key) {
  return !REMOVED_PARENT_ENV.has(key.toLowerCase())
}

const REMOVED_PARENT_ENV = new Set(['bugsnag_key'])
