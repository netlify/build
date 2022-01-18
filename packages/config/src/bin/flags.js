/* eslint-disable max-lines */

import process from 'process'

import filterObj from 'filter-obj'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { normalizeCliFeatureFlags } from '../options/feature_flags.js'

// Parse CLI flags
export const parseFlags = function () {
  const { featureFlags: cliFeatureFlags = '', ...flags } = yargs(hideBin(process.argv))
    .options(FLAGS)
    .usage(USAGE)
    .parse()
  const featureFlags = normalizeCliFeatureFlags(cliFeatureFlags)
  const flagsA = { ...flags, featureFlags }
  const flagsB = filterObj(flagsA, isUserFlag)
  return flagsB
}

const jsonParse = function (value) {
  return value === undefined ? undefined : JSON.parse(value)
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
    coerce: jsonParse,
    hidden: true,
  },
  cachedConfig: {
    string: true,
    describe: `JSON configuration object returned by @netlify/config when --output=/ is used
or when using @netlify/config programmatically.
This is done as a performance optimization to cache the configuration loading logic.
Default: none.`,
    coerce: jsonParse,
    hidden: true,
  },
  cachedConfigPath: {
    string: true,
    describe: `File path to the JSON configuration object returned by @netlify/config
when --output=/path is used.
This is done as a performance optimization to cache the configuration loading logic.
Default: none.`,
    hidden: true,
  },
  inlineConfig: {
    string: true,
    describe: `JSON configuration object overriding the configuration file and other settings.
Default: none.`,
    coerce: jsonParse,
    hidden: true,
  },
  configMutations: {
    array: true,
    describe: `Array of changes to apply to the configuration.
Each change must be an object with three properties:
  - "keys": array of keys targetting the property to change
  - "value": new value of that property
  - "event": build event when this change was applied, e.g. "onPreBuild"
Default: empty array.`,
    coerce: jsonParse,
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
  output: {
    string: true,
    describe: `Where to output the JSON result.
Default: "-" (stdout)`,
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
  - 'require': through import('@netlify/config')`,
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
  featureFlags: {
    describe: 'Comma-separated list of feature flags to enable unreleased features',
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
The result is printed as a JSON object on stdout.`

// Remove `yargs`-specific options, shortcuts, dash-cased and aliases
const isUserFlag = function (key, value) {
  return value !== undefined && !INTERNAL_KEYS.has(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = new Set(['help', 'version', '_', '$0'])
/* eslint-enable max-lines */
