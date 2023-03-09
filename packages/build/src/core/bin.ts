#!/usr/bin/env node

import process from 'process'

import { parseFlags } from './flags.js'
import build from './main.js'
import { FALLBACK_SEVERITY_ENTRY } from './severity.js'

// CLI entry point.
// Before adding logic to this file, please consider adding it to the main
// programmatic command instead, so that the new logic is available when run
// programmatically as well. This file should only contain logic that makes
// sense only in CLI, such as CLI flags parsing and exit code.
async function runCli() {
  const flags = parseFlags()
  const state = { done: false }
  process.on('exit', onExit.bind(undefined, state))

  const { severityCode, logs } = await build(flags)
  printLogs(logs)
  process.exitCode = severityCode

  state.done = true
}

// Used mostly for testing
const printLogs = function (logs) {
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
const onExit = function ({ done }, exitCode) {
  if (done || exitCode !== 0) {
    return
  }

  const [, processName] = process.argv
  console.log(`${processName} exited with exit code ${exitCode} without finishing the build.`)

  process.exitCode = FALLBACK_SEVERITY_ENTRY.severityCode
}

runCli()
