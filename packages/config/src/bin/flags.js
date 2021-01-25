'use strict'

const filterObj = require('filter-obj')
const yargs = require('yargs')

// Parse CLI flags
const parseFlags = function () {
  const flags = yargs.options(FLAGS).usage(USAGE).parse()
  const flagsA = filterObj(flags, isUserFlag)
  return flagsA
}

// List of CLI flags
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
  inlineConfig: {
    describe: `Configuration properties overriding the configuration file and other settings.
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
  stable: {
    boolean: true,
    describe: `Sort keys printed in the output.
Default: false`,
    default: false,
  },
  token: {
    string: true,
    describe: `Netlify API token for authentication.
The NETLIFY_AUTH_TOKEN environment variable can be used as well.`,
  },
  host: {
    string: true,
    describe: `Host of the Netlify API.`,
    hidden: true,
  },
  scheme: {
    string: true,
    describe: `Scheme/protocol of the Netlify API.`,
    hidden: true,
  },
  pathPrefix: {
    string: true,
    describe: `Base path prefix of the Netlify API.`,
    hidden: true,
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
  branch: {
    string: true,
    describe: `Repository branch.
Default: automatically guessed`,
  },
  baseRelDir: {
    boolean: true,
    describe: `Feature flag meant for backward compatibility.
When enabled, if the 'build.base' configuration property is defined, it is used
to try to retrieve a second configuration file and discard the first one.
Default: true`,
    hidden: true,
  },
  mode: {
    string: true,
    describe: `Environment in which this is loaded. Can be:
  - 'buildbot': within Netlify Buildbot
  - 'cli': within Netlify CLI
  - 'require': through require('@netlify/config')`,
    hidden: true,
  },
  debug: {
    boolean: true,
    describe: 'Print debugging information',
    hidden: true,
  },
  testOpts: {
    describe: 'Options for testing only',
    hidden: true,
  },
  offline: {
    boolean: true,
    describe: `Do not send requests to the Netlify API to retrieve site settings.
Default: false`,
  },
  buffer: {
    boolean: true,
    describe: 'Buffer output instead of streaming it',
    hidden: true,
  },
}

const USAGE = `netlify-config [OPTIONS...]

Retrieve and resolve the Netlify configuration.
The result is printed as a JSON object on stdout with the following properties:
  - config     {object}  Resolved configuration object
  - configPath {string?} Path to the configuration file (if any)
  - buildDir   {string}  Absolute path to the build directory
  - context    {string}  Build context
  - branch     {string}  Repository branch`

// Remove `yargs`-specific options, shortcuts, dash-cased and aliases
const isUserFlag = function (key, value) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])

module.exports = { parseFlags }
