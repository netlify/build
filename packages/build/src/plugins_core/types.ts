import { type DynamicMethods } from 'packages/js-client/lib/types.js'

import type { NetlifyPluginConstants } from '../core/constants.js'
import type { BufferedLogs } from '../log/logger.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'
import type { ReturnValue } from '../steps/return_values.js'

type $TSFixme = any

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
  packagePath?: string
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
  quiet?: boolean
  debug?: boolean
  events: string[]
  logs?: BufferedLogs
  systemLog: SystemLogger
  edgeFunctionsBootstrapURL?: string
  featureFlags?: Record<string, any>

  headersPath?: string
  redirectsPath?: string
  configMutations: unknown[] // FIXME
  configPath: string
  netlifyConfig: NetlifyConfig
  explicitSecretKeys: $TSFixme
  enhancedSecretScan: boolean
  deployEnvVars: { key: string; value: string; isSecret: boolean; scopes: string[] }[]
  userNodeVersion?: string
  childEnv: $TSFixme
  returnValues: Record<string, ReturnValue>

  buildbotServerSocket?: string
  api: DynamicMethods
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

export type SystemLogger = (...args: any[]) => void
