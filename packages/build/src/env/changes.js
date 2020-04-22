const process = require('process')

const filterObj = require('filter-obj')
const mapObj = require('map-obj')

// If plugins modify `process.env`, this is propagated in other plugins and in
// `build.command`. Since those are different processes, we figure out when they
// do this and communicate the new `process.env` to other processes.
const getNewEnvChanges = function(envBefore) {
  const currentEnv = getCurrentEnv()
  const envChanges = filterObj(currentEnv, (name, value) => value !== envBefore[name])
  const deletedEnv = filterObj(envBefore, name => currentEnv[name] === undefined)
  const deletedEnvA = mapObj(deletedEnv, setToNull)
  return { ...envChanges, ...deletedEnvA }
}

// `undefined` is not JSON-serializable (which is used in process IPC), so we
// convert it to `null`
// Note: `process.env[name] = undefined` actually does
// `process.env[name] = 'undefined'` in Node.js.
const setToNull = function(name) {
  return [name, null]
}

// Set `process.env` changes from a previous different plugin.
// Can also merge with a `currentEnv` plain object instead of `process.env`.
const setEnvChanges = function(envChanges, currentEnv = getCurrentEnv()) {
  Object.entries(envChanges).forEach(([name, value]) => setEnvChange(name, value, currentEnv))
  return { ...currentEnv }
}

const setEnvChange = function(name, value, currentEnv) {
  if (currentEnv[name] === value) {
    return
  }

  if (value === null) {
    delete currentEnv[name]
    return
  }

  currentEnv[name] = value
}

const getCurrentEnv = function() {
  return process.env
}

module.exports = { getNewEnvChanges, setEnvChanges }
