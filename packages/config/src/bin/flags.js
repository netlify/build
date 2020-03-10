const yargs = require('yargs')
const filterObj = require('filter-obj')

// Parse CLI flags
const parseFlags = function() {
  const flags = yargs
    .options(FLAGS)
    .usage(USAGE)
    .parse()
  const flagsA = filterObj(flags, isUserFlag)
  return flagsA
}

// List of CLI flags
const FLAGS = {
  config: {
    string: true,
    describe: `Path to the configuration file.
Defaults to a netlify.yml, netlify.yaml, netlify.toml or netlify.json in the git repository root directory or the base directory`,
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
const isUserFlag = function(key, value) {
  return value !== undefined && !INTERNAL_KEYS.includes(key) && key.length !== 1 && !key.includes('-')
}

const INTERNAL_KEYS = ['help', 'version', '_', '$0']

module.exports = { parseFlags }
