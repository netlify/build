import { promises as fs } from 'fs'
import { dirname } from 'path'
import process from 'process'

import fastSafeStringify from 'fast-safe-stringify'

import { isUserError } from '../error.js'
import { resolveConfig } from '../main.js'
import type { Config } from '../types/result.js'

import { parseFlags } from './flags.js'

const DEFAULT_OUTPUT = '-'

/** Properties removed from the output. */
const SECRET_PROPERTIES = new Set(['token'])

/** Print the resolved configuration as JSON. User errors exit with 1, and bugs with 2. */
const runCli = async function () {
  try {
    const { stable, output = DEFAULT_OUTPUT, ...flags } = parseFlags()
    const result = await resolveConfig(flags)
    await handleCliSuccess(result, stable, output)
  } catch (error) {
    handleCliError(error)
  }
}

const handleCliSuccess = async function (result: Config, stable: boolean, output: string) {
  const serializable = Object.fromEntries(
    Object.entries(serializeApi(result)).filter(([key]) => !SECRET_PROPERTIES.has(key)),
  )
  // The package's types describe its CommonJS export as the module object, hence `.default`.
  const resultJson = stable
    ? fastSafeStringify.default.stableStringify(serializable, undefined, 2)
    : JSON.stringify(serializable, null, 2)
  await outputResult(resultJson, output)
  process.exitCode = 0
}

const outputResult = async function (resultJson: string, output: string) {
  if (output === '-') {
    console.log(resultJson)
    return
  }

  await fs.mkdir(dirname(output), { recursive: true })
  await fs.writeFile(output, resultJson)
}

// The API client can't be serialized, so it's replaced by whether there is one.
const serializeApi = function ({ api, ...result }: Config): Omit<Config, 'api'> & { hasApi?: true } {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

const handleCliError = function (error: unknown) {
  if (isUserError(error)) {
    console.error(error.message)
    process.exitCode = 1
    return
  }

  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 2
}

await runCli()
