import { env } from 'process'

import filterObj from 'filter-obj'
import mapObj from 'map-obj'

// If plugins modify `process.env`, this is propagated in other plugins and in
// `build.command`. Since those are different processes, we figure out when they
// do this and communicate the new `process.env` to other processes.
export const getNewEnvChanges = function (envBefore, netlifyConfig, netlifyConfigCopy) {
  const processEnvChanges = diffEnv(envBefore, env)
  const netlifyConfigEnvChanges = diffEnv(netlifyConfig.build.environment, netlifyConfigCopy.build.environment)
  return { ...processEnvChanges, ...netlifyConfigEnvChanges }
}

const diffEnv = function (envBefore, envAfter) {
  const envChanges = filterObj(envAfter, (name, value) => value !== envBefore[name])
  const deletedEnv = filterObj(envBefore, (name) => envAfter[name] === undefined)
  const deletedEnvA = mapObj(deletedEnv, setToNull)
  return { ...envChanges, ...deletedEnvA }
}

// `undefined` is not JSON-serializable (which is used in process IPC), so we
// convert it to `null`
// Note: `process.env[name] = undefined` actually does
// `process.env[name] = 'undefined'` in Node.js.
const setToNull = function (name) {
  return [name, null]
}

// Set `process.env` changes from a previous different plugin.
// Can also merge with a `currentEnv` plain object instead of `process.env`.
export const setEnvChanges = function (envChanges, currentEnv = env) {
  Object.entries(envChanges).forEach(([name, value]) => {
    setEnvChange(name, value, currentEnv)
  })
  return { ...currentEnv }
}

const setEnvChange = function (name, value, currentEnv) {
  if (currentEnv[name] === value) {
    return
  }

  if (value === null) {
    // `currentEnv` is a mutable variable
    // eslint-disable-next-line fp/no-delete
    delete currentEnv[name]
    return
  }

  currentEnv[name] = value
}
