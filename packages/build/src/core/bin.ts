import { readFileSync } from 'fs'
import process from 'process'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import type { BufferedLogs } from '../log/logger.js'
import type { RootPackageJson } from '../utils/json.js'

import { normalizeCliFeatureFlags } from './feature_flags.js'
import { FLAGS } from './flags.js'
import { buildSite } from './main.js'
import { FALLBACK_SEVERITY_ENTRY } from './severity.js'

// Our own `package.json`, so its shape is known
const packJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as RootPackageJson

// CLI entry point.
// Before adding logic to this file, please consider adding it to the main
// programmatic command instead, so that the new logic is available when run
// programmatically as well. This file should only contain logic that makes
// sense only in CLI, such as CLI flags parsing and exit code.
const runCli = async function () {
  const flags = parseFlags()
  const flagsA = Object.fromEntries(Object.entries(flags).filter(isUserFlag))

  const state = { done: false }
  process.on('exit', onExit.bind(undefined, state))

  const { severityCode, logs } = await buildSite(flagsA)
  printLogs(logs)
  process.exitCode = severityCode

  state.done = true
}

const parseFlags = function () {
  const { featureFlags: cliFeatureFlags = '', ...flags } = yargs(hideBin(process.argv))
    .options(FLAGS)
    .usage(USAGE)
    .version(packJson.version)
    .parseSync()
  // `featureFlags` has no yargs type, so this is not always a string: `--featureFlags=1` crashes `.split()`
  const featureFlags = normalizeCliFeatureFlags(cliFeatureFlags as string)
  return { ...flags, featureFlags }
}

const USAGE = `netlify-build [OPTIONS...]

Run Netlify Build system locally.

Options can also be specified as environment variables prefixed with
NETLIFY_BUILD_. For example the environment variable NETLIFY_BUILD_DRY=true can
be used instead of the CLI flag --dry.`

// Remove `yargs`-specific options, shortcuts, dash-cased and aliases
const isUserFlag = function ([key, value]: [string, unknown]) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0', 'dryRun'])

// Used mostly for testing
const printLogs = function (logs: BufferedLogs | undefined) {
  if (logs === undefined) {
    return
  }

  const allLogs = [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
  console.log(allLogs)
}

// In theory, the main process should not exit until the main `build()` function
// has completed. In practice, this might happen due to bugs.
// Making the exit code not 0 in that case ensures the caller knows that the
// build has completed when the exit code is 0. This `exit` event handlers
// guarantees this.
const onExit = function ({ done }: { done: boolean }, exitCode: number) {
  if (done || exitCode !== 0) {
    return
  }

  const [, processName] = process.argv
  console.log(`${String(processName)} exited with exit code ${String(exitCode)} without finishing the build.`)

  process.exitCode = FALLBACK_SEVERITY_ENTRY.severityCode
}

void runCli()
