#!/usr/bin/env node
'use strict'

const { writeFile } = require('fs')
const { dirname } = require('path')
const process = require('process')
const { promisify } = require('util')

const { stableStringify } = require('fast-safe-stringify')
const makeDir = require('make-dir')
const omit = require('omit.js').default

require('../utils/polyfills')

const { isUserError } = require('../error')
const resolveConfig = require('../main')

const { parseFlags } = require('./flags')

const pWriteFile = promisify(writeFile)

// CLI entry point
const runCli = async function () {
  try {
    const { stable, output = DEFAULT_OUTPUT, ...flags } = parseFlags()
    const result = await resolveConfig(flags)
    await handleCliSuccess(result, stable, output)
  } catch (error) {
    handleCliError(error)
  }
}

const DEFAULT_OUTPUT = '-'

// The result is output as JSON on success (exit code 0)
const handleCliSuccess = async function (result, stable, output) {
  const resultA = serializeApi(result)
  const resultB = omitProperties(resultA)
  const stringifyFunc = stable ? stableStringify : JSON.stringify
  const resultJson = stringifyFunc(resultB, null, 2)
  await outputResult(resultJson, output)
  process.exitCode = 0
}

const outputResult = async function (resultJson, output) {
  if (output === '-') {
    console.log(resultJson)
    return
  }

  await makeDir(dirname(output))
  await pWriteFile(output, resultJson)
}

// `api` is not JSON-serializable, so we remove it
// We still indicate it as a boolean
const serializeApi = function ({ api, ...result }) {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

// Redirects in plugins (`netlifyConfig.redirects`) should have the same shape
// as in `netlify.toml`. This leads to `@netlify/config` returning the same
// shape as well. However, the buildbot uses a different shape. Therefore the
// CLI does not output those to avoid the buildbot crashing due to different
// `redirects` shapes.
const omitProperties = function ({ config, ...result }) {
  const resultA = omit(result, SECRET_PROPERTIES)
  const configA = { ...config, redirects: [] }
  return { ...resultA, config: configA }
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
