import { resolve } from 'path'
import process from 'process'

import { isDirectory } from 'path-type'

import { throwUserError } from '../error.js'
import { getBufferLogs } from '../log/logger.js'
import { logOpts } from '../log/main.js'
import type { PartialNetlifyConfig } from '../types/config.js'
import type { BufferedLogs } from '../types/logs.js'
import type { ConfigMutation } from '../types/mutations.js'
import type { ModeOption, ResolveConfigOptions } from '../types/options.js'
import { nonEmpty } from '../utils/non_empty.js'
import { removeFalsy } from '../utils/remove_falsy.js'

import { getBaseOverride } from './base.js'
import { getBranch } from './branch.js'
import { DEFAULT_FEATURE_FLAGS } from './feature_flags.js'
import { getRepositoryRoot } from './repository_root.js'

// Local builds have no deploy, so they use placeholder IDs.
const DEFAULT_DEPLOY_ID = '0'
const DEFAULT_BUILD_ID = '0'

/** The options, with defaults, many of them from environment variables. */
export type DefaultedOptions = ResolveConfigOptions & {
  defaultConfig: PartialNetlifyConfig
  inlineConfig: PartialNetlifyConfig
  configMutations: ConfigMutation[]
  cwd: string
  env: Record<string, string | undefined>
  context: string
  deployId: string
  buildId: string
  mode: ModeOption
  offline: boolean
  debug: boolean
  buffer: boolean
  featureFlags: Record<string, unknown>
  /** Only with the `buffer` option. A `logs` option is ignored. */
  logs: BufferedLogs | undefined
}

/** The options, with directories resolved and checked. */
export type NormalizedOptions = DefaultedOptions & {
  repositoryRoot: string
  branch: string
}

/**
 * Add defaults to the options. Empty options (`undefined`, `null`, or blank strings) count as
 * missing, but `false` doesn't.
 */
export const addDefaultOpts = function (options: ResolveConfigOptions = {}): DefaultedOptions {
  const givenOptions = removeFalsy(options)
  const defaultOptions = getDefaultOpts(givenOptions)
  const withDefaults = removeFalsy({
    ...defaultOptions,
    ...givenOptions,
    featureFlags: { ...defaultOptions.featureFlags, ...givenOptions.featureFlags },
  }) as Omit<DefaultedOptions, 'logs'>
  const defaultedOptions = { ...withDefaults, logs: getBufferLogs(withDefaults) }

  logOpts(givenOptions, defaultedOptions)

  return defaultedOptions
}

const getDefaultOpts = function ({ env = {}, cwd, defaultConfig = {} }: ResolveConfigOptions) {
  const combinedEnv = { ...process.env, ...env }
  return {
    defaultConfig,
    // `process.cwd()` can throw, so it's only called when needed.
    ...(cwd === undefined && { cwd: process.cwd() }),
    env,
    context: nonEmpty(combinedEnv.CONTEXT) ?? 'production',
    branch: combinedEnv.BRANCH,
    host: combinedEnv.NETLIFY_API_HOST,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    siteId: combinedEnv.NETLIFY_SITE_ID,
    deployId: nonEmpty(combinedEnv.DEPLOY_ID) ?? DEFAULT_DEPLOY_ID,
    skewProtectionToken: combinedEnv.NETLIFY_SKEW_PROTECTION_TOKEN,
    buildId: nonEmpty(combinedEnv.BUILD_ID) ?? DEFAULT_BUILD_ID,
    mode: 'require' as const,
    offline: false,
    // Debug mode can also be enabled locally or in the UI build settings through an environment variable.
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG) || Boolean(defaultConfig.build?.environment?.NETLIFY_BUILD_DEBUG),
    buffer: false,
    featureFlags: DEFAULT_FEATURE_FLAGS,
    inlineConfig: {},
    configMutations: [],
  }
}

/**
 * Resolve the repository root and the branch, check that `cwd` and the repository root exist, and
 * add the base directory implied by `cwd`, unless options set it.
 */
export const normalizeOpts = async function (options: DefaultedOptions): Promise<NormalizedOptions> {
  const repositoryRoot = await getRepositoryRoot(options)
  const branch = await getBranch({ ...options, repositoryRoot })
  const withDirectories = await normalizeDirs(removeFalsy({ ...options, repositoryRoot, branch }) as NormalizedOptions)
  const baseOverride = await getBaseOverride(withDirectories)
  return { ...baseOverride, ...withDirectories }
}

// Make `cwd` and `repositoryRoot` absolute, after checking they are directories.
const normalizeDirs = async function (options: NormalizedOptions): Promise<NormalizedOptions> {
  const [cwd, repositoryRoot] = await Promise.all([
    normalizeDir(options.cwd, 'cwd'),
    normalizeDir(options.repositoryRoot, 'repositoryRoot'),
  ])
  return { ...options, cwd, repositoryRoot }
}

const normalizeDir = async function (path: string, optionName: string): Promise<string> {
  const resolvedPath = resolve(path)
  if (!(await isDirectory(path))) {
    throwUserError(`Option '${optionName}' points to a non-existing directory: ${resolvedPath}`)
  }
  return resolvedPath
}
