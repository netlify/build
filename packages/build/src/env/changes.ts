import { env } from 'process'

import type { NetlifyConfig } from '../types/config/netlify_config.js'

type Env = Partial<Record<string, string>>

// `null` marks a deleted variable
export type EnvChanges = Partial<Record<string, string | null>>

// If plugins modify `process.env`, this is propagated in other plugins and in
// `build.command`. Since those are different processes, we figure out when they
// do this and communicate the new `process.env` to other processes.
export const getNewEnvChanges = function (
  envBefore: Env,
  netlifyConfig: NetlifyConfig,
  netlifyConfigCopy: NetlifyConfig,
): EnvChanges {
  const processEnvChanges = diffEnv(envBefore, env)
  const netlifyConfigEnvChanges = diffEnv(netlifyConfig.build.environment, netlifyConfigCopy.build.environment)
  return { ...processEnvChanges, ...netlifyConfigEnvChanges }
}

const diffEnv = function (envBefore: Env, envAfter: Env): EnvChanges {
  const envChanges = Object.fromEntries(Object.entries(envAfter).filter(([name, value]) => value !== envBefore[name]))
  const deletedEnv = Object.fromEntries(Object.entries(envBefore).filter(([name]) => envAfter[name] === undefined))
  const deletedEnvA = Object.fromEntries(Object.entries(deletedEnv).map(setToNull))
  return { ...envChanges, ...deletedEnvA }
}

// `undefined` is not JSON-serializable (which is used in process IPC), so we
// convert it to `null`
// Note: `process.env[name] = undefined` actually does
// `process.env[name] = 'undefined'` in Node.js.
const setToNull = function ([name]: [string, unknown]): [string, null] {
  return [name, null]
}

// Set `process.env` changes from a previous different plugin.
// Can also merge with a `currentEnv` plain object instead of `process.env`.
export const setEnvChanges = function (envChanges: EnvChanges, currentEnv: Env = env): Env {
  Object.entries(envChanges).forEach(([name, value]) => {
    setEnvChange(name, value, currentEnv)
  })
  return { ...currentEnv }
}

const setEnvChange = function (name: string, value: string | null | undefined, currentEnv: Env): void {
  if (currentEnv[name] === value) {
    return
  }

  if (value === null) {
    // `currentEnv` is a mutable variable
    Reflect.deleteProperty(currentEnv, name)
    return
  }

  currentEnv[name] = value
}
