#!/usr/bin/env node

import { Mode } from 'fs'
import process from 'process'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { normalizeCliFeatureFlags } from './feature_flags.js'

const INTERNAL_KEYS = ['help', 'version', '_', '$0', 'dryRun'] as const

/** coerce a stringified object to an object  */
function jsonParse<T extends object = object>(value?: string): T | undefined {
  if (value === undefined) {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    return {} as T
  }
}

/** Remove `yargs`-specific options, shortcuts, dash-cased and aliases */
function filterFlags<T extends object = object>(flags: T) {
  const filtered = {} as NonNullable<Omit<T, typeof INTERNAL_KEYS[number]>>
  const internalKeys = new Set<string>(INTERNAL_KEYS)

  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined && !internalKeys.has(key) && key.length !== 1 && !key.includes('-')) {
      filtered[key] = value
    }
  }
  return filtered
}

export type ParsedCLIFlags = ReturnType<typeof parseFlags>

/** parses all the CLI flags  */
export function parseFlags() {
  const { featureFlags: cliFeatureFlags, ...flags } = yargs(hideBin(process.argv))
    .options({
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
      buildId: {
        string: true,
        describe: `Netlify Build ID.
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
        describe: `Run in dry mode, i.e. printing steps without executing them.
    Default: false`,
      },
      nodePath: {
        string: true,
        describe: `Path to the Node.js binary to use in the build command and plugins.
    Default: Current Node.js binary`,
      },
      functionsDistDir: {
        string: true,
        describe: `Path to the directory where packaged functions are kept.
    Default: automatically guessed`,
        hidden: true,
      },
      edgeFunctionsDistDir: {
        string: true,
        describe: `Path to the directory where packaged Edge Functions are kept.
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
      telemetry: {
        boolean: true,
        describe: `Enable telemetry.
    Default: false`,
      },
      mode: {
        choices: ['buildbot', 'cli', 'require'] as ReadonlyArray<Mode>,
        default: 'require' as Mode,
        string: true,
        describe: `Environment in which this is loaded. Can be:
      - 'buildbot': within Netlify Buildbot
      - 'cli': within Netlify CLI
      - 'require': through import('@netlify/build')`,
        hidden: true,
      },
      debug: {
        boolean: true,
        describe: 'Print user-facing debugging information',
        hidden: true,
      },
      systemLogFile: {
        type: 'number',
        describe: 'File descriptor to where system logs should be piped',
        hidden: true,
      },
      quiet: {
        boolean: true,
        describe: 'Suppresses logging',
        default: false,
        hidden: true,
      },
      verbose: {
        boolean: true,
        describe: 'Print internal debugging information',
        hidden: true,
      },
      sendStatus: {
        boolean: true,
        describe: 'Whether plugin statuses should be sent to the Netlify API',
        hidden: true,
      },
      saveConfig: {
        boolean: true,
        describe: 'Whether configuration changes should be saved to netlify.toml',
        hidden: true,
      },
      outputConfigPath: {
        string: true,
        describe:
          'Path where to save the netlify.toml resulting from configuration changes. Only applicable if `saveConfig` is set. Defaults to "netlify.toml" in the root directory.',
        hidden: true,
      },
      testOpts: {
        describe: 'Options for testing only',
        hidden: true,
      },
      featureFlags: {
        string: true,
        default: '',
        describe: 'Comma-separated list of feature flags to enable unreleased features',
        hidden: true,
      },
      devCycleUser: {
        describe: 'The DevCycle user object that is used to evaluate feature flags',
        coerce: jsonParse,
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
      timeline: {
        string: true,
        describe: 'The sequence of lifecycle events to run',
        hidden: true,
      },
    })
    .usage(
      `netlify-build [OPTIONS...]

Run Netlify Build system locally.

Options can also be specified as environment variables prefixed with
NETLIFY_BUILD_. For example the environment variable NETLIFY_BUILD_DRY=true can
be used instead of the CLI flag --dry.`,
    )
    .parse()
  console.log(process.argv)
  const featureFlags = normalizeCliFeatureFlags(cliFeatureFlags)
  return filterFlags({ ...flags, featureFlags })
}
