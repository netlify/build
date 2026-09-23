import type { NetlifyAPI } from '@netlify/api'

import type { NetlifyPluginConstants } from '../core/constants.js'
import type { FeatureFlags } from '../core/feature_flags.js'
import type { Logs } from '../log/logger.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'
import type { ReturnValue } from '../steps/return_values.js'

export type CoreStepFunctionArgs = {
  /**
   * The absolute process working directory of a build
   */
  buildDir: string
  /**
   * the directory inside a mono repository where it collects the settings from.
   * This is the value of the package directory field of the build settings
   * `undefined` if none is set.
   */
  packagePath?: string | undefined
  repositoryRoot: string
  deployId: string
  /**
   * The deploy context (e.g. 'production', 'deploy-preview', 'branch-deploy')
   */
  context: string
  /**
   * The branch being built (e.g. 'main', 'my-feature-123')
   */
  branch: string
  saveConfig: boolean
  constants: NetlifyPluginConstants
  quiet?: boolean | undefined
  debug?: boolean | undefined
  events: string[]
  logs?: Logs | undefined
  systemLog: SystemLogger
  edgeFunctionsBootstrapURL?: string | undefined
  featureFlags: FeatureFlags

  headersPath?: string | undefined
  redirectsPath?: string | undefined
  configMutations: unknown[] // FIXME
  configPath: string
  netlifyConfig: NetlifyConfig
  /** Comma-separated, from the `--explicitSecretKeys` flag */
  explicitSecretKeys?: string | undefined
  enhancedSecretScan: boolean
  deployEnvVars: { key: string; value: string; isSecret: boolean; scopes: string[] }[]
  userNodeVersion?: string | undefined
  childEnv: NodeJS.ProcessEnv
  returnValues: Record<string, ReturnValue>

  buildbotServerSocket?: string | undefined
  api: NetlifyAPI
}

export type CoreStepFunction = (args: CoreStepFunctionArgs) => Promise<object>
export type CoreStepCondition = (args: CoreStepFunctionArgs) => Promise<boolean> | boolean

export type Event = 'onPreBuild' | 'onBuild' | 'onPostBuild' | 'onPreDev' | 'onDev' | 'onPostDev'

export type CoreStep = {
  event: Event
  coreStep: CoreStepFunction
  coreStepId: string
  coreStepName: string
  coreStepDescription: () => string
  condition?: CoreStepCondition
  quiet?: boolean
}

export type SystemLogger = (...args: unknown[]) => void
