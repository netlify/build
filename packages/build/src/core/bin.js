#!/usr/bin/env node

const process = require('process')

const filterObj = require('filter-obj')
const yargs = require('yargs')

require('../utils/polyfills')

const build = require('./main')

// CLI entry point.
// Before adding logic to this file, please consider adding it to the main
// programmatic command instead, so that the new logic is available when run
// programmatically as well. This file should only contain logic that makes
// sense only in CLI, such as CLI flags parsing and exit code.
const runCli = async function() {
  const flags = parseFlags()
  const flagsA = filterObj(flags, isUserFlag)

  const { success, logs } = await build(flagsA)
  printLogs(logs)
  process.exitCode = success ? 0 : 1
}

const parseFlags = function() {
  return yargs
    .options(FLAGS)
    .usage(USAGE)
    .parse()
}

const FLAGS = {
  config: {
    string: true,
    describe: `Path to the configuration file.
Defaults to any netlify.toml in the git repository root directory or the base directory`,
  },
  defaultConfig: {
    string: true,
    describe: `JSON configuration object containing default values.
Each configuration default value is used unless overriden through the main configuration file.
Default: none.`,
    hidden: true,
  },
  cachedConfig: {
    string: true,
    describe: `JSON configuration object returned by @netlify/config.
This is done as a performance optimization to cache the configuration loading logic.
Default: none.`,
    hidden: true,
  },
  cwd: {
    string: true,
    describe: `Current directory. Used to retrieve the configuration file.
Default: current directory`,
  },
  repositoryRoot: {
    string: true,
    describe: `Git repository root directory. Used to retrieve the configuration file.
Default: automatically guessed`,
  },
  token: {
    string: true,
    describe: `Netlify API token for authentication.
The NETLIFY_AUTH_TOKEN environment variable can be used as well.`,
  },
  siteId: {
    string: true,
    describe: `Netlify Site ID.`,
  },
  deployId: {
    string: true,
    describe: `Netlify Deploy ID.
Default: automatically guessed`,
  },
  context: {
    string: true,
    describe: `Build context.
Default: 'production'`,
  },
  branch: {
    string: true,
    describe: `Repository branch.
Default: automatically guessed`,
  },
  framework: {
    string: true,
    describe: 'Front-end framework.',
    hidden: true,
  },
  baseRelDir: {
    boolean: true,
    describe: `Feature flag meant for backward compatibility.
When enabled, if the 'build.base' configuration property is defined, it is used
to try to retrieve a second configuration file and discard the first one.
Default: true`,
    hidden: true,
  },
  dry: {
    alias: 'dry-run',
    boolean: true,
    describe: `Run in dry mode, i.e. printing commands without executing them.
Default: false`,
  },
  nodePath: {
    string: true,
    describe: `Path to the Node.js binary to use in user commands and build plugins.
Default: Current Node.js binary`,
  },
  functionsDistDir: {
    string: true,
    describe: `Path to the directory where packaged functions are kept.
Default: automatically guessed`,
    hidden: true,
  },
  buildImagePluginsDir: {
    string: true,
    describe: `Path to the directory when build plugins are pre-installed.
Default: none`,
    hidden: true,
  },
  telemetry: {
    boolean: true,
    describe: `Enable telemetry.
Default: true`,
  },
  mode: {
    string: true,
    describe: `Environment in which this is loaded. Can be:
  - 'buildbot': within Netlify Buildbot
  - 'cli': within Netlify CLI
  - 'require': through require('@netlify/build')`,
    hidden: true,
  },
  debug: {
    boolean: true,
    describe: 'Print debugging information',
    hidden: true,
  },
  sendStatus: {
    boolean: true,
    describe: 'Whether plugin statuses should be sent to the Netlify API',
    hidden: true,
  },
  testOpts: {
    describe: 'Options for testing only',
    hidden: true,
  },
  statsd: {
    describe: 'Statsd-related options, for performance measuring',
    hidden: true,
  },
  'statsd.host': {
    type: 'string',
    describe: 'Statsd host',
    hidden: true,
  },
  'statsd.port': {
    type: 'number',
    describe: 'Statsd port',
    hidden: true,
  },
  buffer: {
    boolean: true,
    describe: 'Buffer output instead of printing it',
  },
}

const USAGE = `netlify-build [OPTIONS...]

Run Netlify Build system locally.

Options can also be specified as environment variables prefixed with
NETLIFY_BUILD_. For example the environment variable NETLIFY_BUILD_DRY=true can
be used instead of the CLI flag --dry.`

// Remove `yargs`-specific options, shortcuts, dash-cased and aliases
const isUserFlag = function(key, value) {
  return value !== undefined && !INTERNAL_KEYS.includes(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0', 'dryRun']

// Used mostly for testing
const printLogs = function(logs) {
  if (logs === undefined) {
    return
  }

  const allLogs = [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
  console.log(allLogs)
}

runCli()
