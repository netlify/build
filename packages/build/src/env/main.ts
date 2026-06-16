import { env } from 'process'

import { getParentColorEnv } from '../log/colors.js'

// Retrieve the environment variables passed to plugins and `build.command`
// When run locally, this tries to emulate the production environment.
export const getChildEnv = function ({ envOpt, env: allConfigEnv }) {
  const parentColorEnv = getParentColorEnv()
  const parentEnv = { ...env, ...allConfigEnv, ...envOpt, ...parentColorEnv }
  return Object.fromEntries(Object.entries(parentEnv).filter(([key]) => shouldKeepEnv(key)))
}

const shouldKeepEnv = function (key: string) {
  return !REMOVED_PARENT_ENV.has(key.toLowerCase())
}

const REMOVED_PARENT_ENV = new Set(['bugsnag_key'])
