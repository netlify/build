#!/usr/bin/env node

import { writeFile } from 'fs'
import { dirname } from 'path'
import process from 'process'
import { promisify } from 'util'

import fastSafeStringify from 'fast-safe-stringify'
import makeDir from 'make-dir'
import omit from 'omit.js'

import { isUserError } from '../error.js'
import { resolveConfig } from '../main.js'

import { parseFlags } from './flags.js'

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
  const resultB = omit.default(resultA, SECRET_PROPERTIES)
  const stringifyFunc = stable ? fastSafeStringify.stableStringify : JSON.stringify
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
