import type { PartialNetlifyConfig } from '../types/config.js'
import type { Logs } from '../types/logs.js'
import type { ResolveConfigOptions } from '../types/options.js'
import type { Config } from '../types/result.js'

import { cleanupConfig, cleanupEnvironment } from './cleanup.js'
import { logObject, logSubHeader } from './logger.js'
import { cleanupConfigOpts } from './options.js'

type DebugLogOptions = { logs: Logs | undefined; debug: boolean }

/**
 * Print the options in debug mode. `@netlify/build` calls `@netlify/config` a second time with a
 * cached config, so they are only printed on the first call.
 */
export const logOpts = function (
  options: ResolveConfigOptions,
  {
    logs,
    debug,
    cachedConfig,
    cachedConfigPath,
  }: DebugLogOptions & Pick<ResolveConfigOptions, 'cachedConfig' | 'cachedConfigPath'>,
) {
  if (!debug || cachedConfig !== undefined || cachedConfigPath !== undefined) {
    return
  }

  logSubHeader(logs, 'Initial build environment')
  logObject(logs, cleanupConfigOpts(options))
}

export const logDefaultConfig = function (
  defaultConfig: PartialNetlifyConfig,
  { logs, debug, baseRelDir }: DebugLogOptions & { baseRelDir: boolean },
) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'UI build settings')
  logObject(logs, cleanupConfig({ ...defaultConfig, baseRelDir }))
}

export const logInlineConfig = function (inlineConfig: PartialNetlifyConfig, { logs, debug }: DebugLogOptions) {
  if (!debug || Object.keys(inlineConfig).length === 0) {
    return
  }

  logSubHeader(logs, 'Configuration override')
  logObject(logs, cleanupConfig(inlineConfig))
}

export const logResult = function (
  {
    configPath,
    buildDir,
    config,
    context,
    branch,
    env,
  }: Pick<Config, 'configPath' | 'buildDir' | 'config' | 'context' | 'branch' | 'env'>,
  { logs, debug }: DebugLogOptions,
) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved build environment')
  logObject(logs, { configPath, buildDir, context, branch, env: cleanupEnvironment(env) })

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupConfig(config))
}
