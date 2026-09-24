import yargs, { type Options } from 'yargs'

import type { ResolveConfigOptions } from '../types.js'

export type CliFlags = ResolveConfigOptions & {
  /** Sort the keys of the output. */
  stable: boolean
  /** Where to write the result, `-` for stdout. */
  output: string
}

/** Unknown flags are passed on. On invalid JSON or `--help`, yargs prints and exits the process. */
export const parseFlags = function (argv: string[]): CliFlags {
  const { featureFlags, output, ...flags } = yargs(argv).options(FLAGS).usage(USAGE).parseSync()
  // The JSON flags aren't checked here: `resolveConfig` checks the configuration, and trusts `cachedConfig`.
  return {
    ...flags,
    output: output ?? '-',
    featureFlags: parseFeatureFlags(featureFlags),
  } as CliFlags
}

/** `a,b` gives `{ a: true, b: true }`. Blank names are skipped, but the others are not trimmed. */
const parseFeatureFlags = function (value: unknown): Record<string, boolean> {
  if (typeof value !== 'string') {
    return {}
  }

  const names = value.split(',').filter((name) => name.trim() !== '')
  return Object.fromEntries(names.map((name) => [name, true]))
}

// yargs passes every occurrence of an `array` flag, so `--configMutations` must be one JSON array.
const parseJson = function (value: string | string[]): unknown {
  return JSON.parse(String(value))
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
Each configuration default value is used unless overridden through the main configuration file.
Default: none.`,
    coerce: parseJson,
    hidden: true,
  },
  cachedConfig: {
    string: true,
    describe: `JSON configuration object returned by @netlify/config when --output=/ is used
or when using @netlify/config programmatically.
This is done as a performance optimization to cache the configuration loading logic.
Default: none.`,
    coerce: parseJson,
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
    coerce: parseJson,
    hidden: true,
  },
  configMutations: {
    array: true,
    describe: `Array of changes to apply to the configuration.
Each change must be an object with three properties:
  - "keys": array of keys targeting the property to change
  - "value": new value of that property
  - "event": build event when this change was applied, e.g. "onPreBuild"
Default: empty array.`,
    coerce: parseJson,
    hidden: true,
  },
  cwd: {
    string: true,
    describe: `Current directory. Used to retrieve the configuration file.
Default: current directory`,
  },
  packagePath: {
    string: true,
    describe: `A relative path from the repository root to the package. Used inside monorepos to specify a package`,
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
  accountId: {
    string: true,
    describe: 'Netlify Account ID. This will only be available in buildbot mode.',
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
} satisfies Record<string, Options>

const USAGE = `netlify-config [OPTIONS...]

Retrieve and resolve the Netlify configuration.
The result is printed as a JSON object on stdout.`
