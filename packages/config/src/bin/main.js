#!/usr/bin/env node
'use strict'

const process = require('process')

const { stableStringify } = require('fast-safe-stringify')
const omit = require('omit.js').default

require('../utils/polyfills')

const { isUserError } = require('../error')
const resolveConfig = require('../main')

const { parseFlags } = require('./flags')

// CLI entry point
const runCli = async function () {
  try {
    const { stable, ...flags } = parseFlags()
    const result = await resolveConfig(flags)
    handleCliSuccess(result, stable)
  } catch (error) {
    handleCliError(error)
  }
}

// The result is printed as JSON on stdout on success (exit code 0)
const handleCliSuccess = function (result, stable) {
  const resultA = serializeApi(result)
  const resultB = omit(resultA, SECRET_PROPERTIES)
  const stringifyFunc = stable ? stableStringify : JSON.stringify
  const resultJson = stringifyFunc(resultB, null, 2)
  console.log(resultJson)
  process.exitCode = 0
}

// `api` is not JSON-serializable, so we remove it
// We still indicate it as a boolean
const serializeApi = function ({ api, ...result }) {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

const SECRET_PROPERTIES = ['token']

const handleCliError = function (error) {
  // Errors caused by users do not show stack traces and have exit code 1
  if (isUserError(error)) {
    console.error(error.message)
    process.exitCode = 1
    return
  }

  // Internal errors / bugs have exit code 2
  console.error(error.stack)
  process.exitCode = 2
}

runCli()
