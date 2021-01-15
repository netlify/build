'use strict'

const { env } = require('process')

const filterObj = require('filter-obj')
const mapObj = require('map-obj')

// Keep a copy of `process.env` before running any plugin method
const getEnvBefore = function () {
  return { ...env }
}

// If plugins modify `process.env`, this is propagated to the build command.
// Since those are different processes, we figure out when they
// do this and communicate the new `process.env` to other processes.
const getNewEnvChanges = function (envBefore) {
  const envChanges = filterObj(env, (name, value) => value !== envBefore[name])
  const deletedEnv = filterObj(envBefore, (name) => env[name] === undefined)
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

// Retrieve build command environment variables after applying any
// `process.env` changes from plugins.
const getBuildCommandEnv = function (childEnv, envChanges) {
  return filterObj({ ...childEnv, ...envChanges }, isNotNull)
}

const isNotNull = function (name, value) {
  return value !== null
}

module.exports = { getEnvBefore, getNewEnvChanges, getBuildCommandEnv }
