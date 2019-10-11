#!/usr/bin/env node
const yargs = require('yargs')
const filterObj = require('filter-obj')

require('../utils/polyfills')

const build = require('./main')

// CLI entry point
const runCli = async function() {
  const options = parseArgs()
  const optionsA = filterObj(options, isUserOption)
  await build(optionsA)
}

const parseArgs = function() {
  return yargs
    .options(OPTIONS)
    .usage(USAGE)
    .strict()
    .parse()
}

const OPTIONS = {
  config: {
    string: true,
    describe: `Path to the configuration file.
Defaults to any netlify.yml, netlify.toml, netlify.json or netlify.js file in
the current directory or any parent directory`
  },
  token: {
    string: true,
    describe: `Netlify API token for authentication.
The NETLIFY_TOKEN environment variable can be used as well.`
  },
  context: {
    string: true,
    describe: `Build context.
Default: 'production'`
  },
  dry: {
    boolean: true,
    describe: `Run in dry mode, i.e. printing commands without
executing them.
Default: false`
  },
  verbose: {
    boolean: true,
    describe: `Print messages and errors verbosely.
Default: false`
  }
}

const USAGE = `$0 [OPTIONS...]

Run Netlify Build system locally.

Options can also be specified as environment variables prefixed with
NETLIFY_BUILD_. For example the environment variable NETLIFY_BUILD_DRY=true can
be used instead of the CLI flag --dry.`

// Remove `yargs`-specific options, shortcuts and dash-cased
const isUserOption = function(key, value) {
  return value !== undefined && !INTERNAL_KEYS.includes(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0']

runCli()
