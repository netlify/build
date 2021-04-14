'use strict'

/* eslint eslint-comments/no-use: off, max-lines: off */

// All CLI flags
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
    coerce: JSON.parse,
    hidden: true,
  },
  cachedConfig: {
    string: true,
    describe: `JSON configuration object returned by @netlify/config.
This is done as a performance optimization to cache the configuration loading logic.
Default: none.`,
    coerce: JSON.parse,
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
  apiHost: {
    string: true,
    describe: `Netlify API endpoint.
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
  cacheDir: {
    string: true,
    describe: `Path to the cache directory.
Default: .netlify/cache/`,
    hidden: true,
  },
  buildbotServerSocket: {
    string: true,
    describe: `Path to the buildbot server socket. This is used to connect to the buildbot to trigger deploys.`,
    hidden: true,
  },
  uiPlugins: {
    string: true,
    describe: `List of UI-installed plugins.
This is a JSON array with properties "package" and "version".
Default: none.`,
    coerce: JSON.parse,
    hidden: true,
  },
  telemetry: {
    boolean: true,
    describe: `Enable telemetry.
Default: false`,
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
  featureFlags: {
    describe: 'Comma-separated list of feature flags to enable unreleased features',
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
  offline: {
    boolean: true,
    describe: `Do not send requests to the Netlify API to retrieve site settings.
Default: false`,
  },
  buffer: {
    boolean: true,
    describe: 'Buffer output instead of printing it',
  },
}

module.exports = { FLAGS }
