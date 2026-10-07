import { promises as fs } from 'fs'
import { dirname } from 'path'
import process from 'process'

import fastSafeStringify from 'fast-safe-stringify'
import { hideBin } from 'yargs/helpers'

import { isUserError } from '../error.js'
import { resolveConfig } from '../resolve.js'
import type { Config } from '../types.js'

import { parseFlags } from './flags.js'

// User errors exit with 1 and bugs with 2. `process.exitCode`, unlike `process.exit()`, lets a large output flush.
const runCli = async function () {
  try {
    const { stable, output, ...flags } = parseFlags(hideBin(process.argv))
    const result = await resolveConfig(flags)
    await writeResult(serializeResult(result, stable), output)
    process.exitCode = 0
  } catch (error) {
    handleCliError(error)
  }
}

/** The API client can't be serialized, so it's replaced by whether there is one. The token is secret. */
const serializeResult = function ({ api, token: _token, ...result }: Config, stable: boolean): string {
  const printable = api === undefined ? result : { ...result, hasApi: true }
  // The package's types describe its CommonJS export as the module object, hence `.default`.
  return stable
    ? fastSafeStringify.default.stableStringify(printable, undefined, 2)
    : JSON.stringify(printable, null, 2)
}

// A relative `output` is resolved from the process's directory, not `--cwd`.
const writeResult = async function (resultJson: string, output: string) {
  if (output === '-') {
    console.log(resultJson)
    return
  }

  await fs.mkdir(dirname(output), { recursive: true })
  await fs.writeFile(output, resultJson)
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
