#!/usr/bin/env node
const { exit } = require('process')
const { promisify } = require('util')

const yargs = require('yargs')
const filterObj = require('filter-obj')

require('../utils/polyfills')

const isNetlifyCI = require('../utils/is-netlify-ci')

const build = require('./main')

const pSetTimeout = promisify(setTimeout)

// CLI entry point
const runCli = async function() {
  const flags = parseFlags()
  const { features, ...flagsA } = filterObj(flags, isUserFlag)

  if (features) {
    return printFeatures()
  }

  const success = await build(flagsA)

  // Some stdout|stderr logs will not have been flushed. This leads the current
  // BuildBot to print some messages before those are flushed.
  // The following is a temporary workaround. This should be fixed once the
  // logic moves from the BuildBot to Netlify Build
  if (isNetlifyCI()) {
    await pSetTimeout(1e3)
  }

  const exitCode = success ? 0 : 1
  exit(exitCode)
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
Defaults to any netlify.yml, netlify.toml, netlify.json or netlify.js file in
the current directory or any parent directory`,
  },
  cwd: {
    string: true,
    describe: `Current directory. Used to retrieve the configuration file.
Default: current directory`,
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
  context: {
    string: true,
    describe: `Build context.
Default: 'production'`,
  },
  dry: {
    alias: 'dry-run',
    boolean: true,
    describe: `Run in dry mode, i.e. printing commands without
executing them.
Default: false`,
  },
  features: {
    boolean: true,
    describe: `Print currently enabled feature flags.
Default: false`,
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

const printFeatures = function() {
  console.log(['', ...FEATURES, ''].join(FEATURES_DELIMITER))
  exit(0)
}

const FEATURES = ['cachesave']
const FEATURES_DELIMITER = '_'

runCli()
