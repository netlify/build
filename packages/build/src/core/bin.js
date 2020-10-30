#!/usr/bin/env node
'use strict'

const process = require('process')

const filterObj = require('filter-obj')
const yargs = require('yargs')

require('../utils/polyfills')

const { FLAGS } = require('./flags')
const build = require('./main')

// CLI entry point.
// Before adding logic to this file, please consider adding it to the main
// programmatic command instead, so that the new logic is available when run
// programmatically as well. This file should only contain logic that makes
// sense only in CLI, such as CLI flags parsing and exit code.
const runCli = async function () {
  const flags = parseFlags()
  const flagsA = filterObj(flags, isUserFlag)

  const { severityCode, logs } = await build(flagsA)
  printLogs(logs)
  process.exitCode = severityCode
}

const parseFlags = function () {
  return yargs.options(FLAGS).usage(USAGE).parse()
}

const USAGE = `netlify-build [OPTIONS...]

Run Netlify Build system locally.

Options can also be specified as environment variables prefixed with
NETLIFY_BUILD_. For example the environment variable NETLIFY_BUILD_DRY=true can
be used instead of the CLI flag --dry.`

// Remove `yargs`-specific options, shortcuts, dash-cased and aliases
const isUserFlag = function (key, value) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0', 'dryRun'])

// Used mostly for testing
const printLogs = function (logs) {
  if (logs === undefined) {
    return
  }

  const allLogs = [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
  console.log(allLogs)
}

runCli()
