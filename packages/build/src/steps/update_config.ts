import { isDeepStrictEqual } from 'util'

import { type getConfigOpts, resolveUpdatedConfig } from '../core/config.js'
import type { ErrorParam } from '../core/types.js'
import { addErrorInfo } from '../error/info.js'
import type { ErrorTypes } from '../error/types.js'
import type { Logs } from '../log/logger.js'
import { logConfigOnUpdate } from '../log/messages/config.js'
import { logConfigMutations, systemLogConfigMutations } from '../log/messages/mutations.js'
import type { ConfigMutation } from '../plugins/child/diff.js'
import type { SystemLogger } from '../plugins_core/types.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'
import { pathExists } from '../utils/path_exists.js'

type UpdatedConfig = {
  netlifyConfig: NetlifyConfig
  configMutations: ConfigMutation[]
  headersPath?: string
  redirectsPath?: string
}

// If `netlifyConfig` was updated or `_redirects` was created, the configuration
// is updated by calling `@netlify/config` again.
export const updateNetlifyConfig = async function ({
  configOpts,
  netlifyConfig,
  defaultConfig,
  headersPath,
  redirectsPath,
  configMutations,
  newConfigMutations,
  configSideFiles,
  errorParams,
  logs,
  systemLog,
  debug,
  source = '',
  configMutationsOrigin = source || undefined,
  configErrorType = 'resolveConfig',
}: {
  configOpts: ReturnType<typeof getConfigOpts>
  netlifyConfig: NetlifyConfig
  defaultConfig: unknown
  headersPath: string | undefined
  redirectsPath: string | undefined
  // Passed by plugin steps but not used: the updated config is resolved with `configOpts.packagePath`
  packagePath?: string | undefined
  configMutations: ConfigMutation[]
  newConfigMutations: ConfigMutation[]
  configSideFiles: string[]
  errorParams: Pick<ErrorParam, 'netlifyConfig'>
  logs: Logs | undefined
  systemLog: SystemLogger
  debug: boolean
  source?: string
  configMutationsOrigin?: string | undefined
  configErrorType?: ErrorTypes
}): Promise<UpdatedConfig> {
  if (!(await shouldUpdateConfig({ newConfigMutations, configSideFiles, headersPath, redirectsPath }))) {
    return { netlifyConfig, configMutations }
  }

  validateConfigMutations(newConfigMutations, configErrorType)

  // Don't log configuration mutations performed by code that has been authored
  // by Netlify (i.e. core steps or build plugins in the `@netlify/` scope),
  // since that won't give users any useful or actionable information. For
  // these, emit a system log instead.
  const shouldLogConfigMutationsToUser = source !== '' && !source.startsWith('@netlify/')

  if (shouldLogConfigMutationsToUser) {
    logConfigMutations(logs, newConfigMutations, debug)
  } else {
    systemLogConfigMutations(systemLog, newConfigMutations)
  }

  const mergedConfigMutations = [...configMutations, ...newConfigMutations]
  // `@netlify/config` types these as `any`
  const updatedConfig: { config: NetlifyConfig; headersPath: string; redirectsPath: string } =
    await resolveUpdatedConfig(configOpts, mergedConfigMutations, defaultConfig, configMutationsOrigin, configErrorType)
  const { config: netlifyConfigA, headersPath: headersPathA, redirectsPath: redirectsPathA } = updatedConfig
  logConfigOnUpdate({ logs, netlifyConfig: netlifyConfigA, debug })

  errorParams.netlifyConfig = netlifyConfigA
  return {
    netlifyConfig: netlifyConfigA,
    configMutations: mergedConfigMutations,
    headersPath: headersPathA,
    redirectsPath: redirectsPathA,
  }
}

const shouldUpdateConfig = async function ({
  newConfigMutations,
  configSideFiles,
  headersPath,
  redirectsPath,
}: {
  newConfigMutations: ConfigMutation[]
  configSideFiles: string[]
  headersPath: string | undefined
  redirectsPath: string | undefined
}) {
  return (
    newConfigMutations.length !== 0 || (await haveConfigSideFilesChanged(configSideFiles, headersPath, redirectsPath))
  )
}

// The configuration mostly depends on `netlify.toml` and UI build settings.
// However, it also uses some additional optional side files like `_redirects`.
// Those are often created by the build command. When those are created, we need
// to update the configuration. We detect this by checking for file existence
// before and after running plugins and the build command.
const haveConfigSideFilesChanged = async function (
  configSideFiles: string[],
  headersPath: string | undefined,
  redirectsPath: string | undefined,
) {
  const newSideFiles = await listConfigSideFiles([headersPath, redirectsPath])
  return !isDeepStrictEqual(newSideFiles, configSideFiles)
}

// List all the files used for configuration besides `netlify.toml`.
// This is useful when applying configuration mutations since those files
// sometimes have higher priority and should therefore be deleted in order to
// apply any configuration update on `netlify.toml`.
export const listConfigSideFiles = async function (sideFiles: (string | undefined)[]) {
  const existingSideFiles = await Promise.all(
    // `pathExists(undefined)` is `false` too
    sideFiles.map(async (sideFile) => (sideFile !== undefined && (await pathExists(sideFile)) ? sideFile : null)),
  )

  // An empty path never exists, so only `null` is filtered out
  return existingSideFiles.filter((sideFile) => sideFile !== null).sort()
}

// Validate each new configuration change
const validateConfigMutations = function (newConfigMutations: ConfigMutation[], errorType: ErrorTypes) {
  try {
    newConfigMutations.forEach(validateConfigMutation)
  } catch (error) {
    addErrorInfo(error, { type: errorType })
    throw error
  }
}

// Triggered when calling `netlifyConfig.{key} = undefined | null`
// We do not allow this because the back-end only receives mutations as a
// `netlify.toml`, i.e. cannot apply property deletions since `undefined` is
// not serializable in TOML.
const validateConfigMutation = function ({ value, keysString }: ConfigMutation) {
  if (value === undefined || value === null) {
    throw new Error(`Setting "netlifyConfig.${keysString}" to ${String(value)} is not allowed.
Please set this property to a specific value instead.`)
  }
}
