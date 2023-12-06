import { NetlifyPluginConstants } from '../core/constants.js'
import { BufferedLogs } from '../log/logger.js'
import { NetlifyConfig } from '../types/config/netlify_config.js'

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
  deployId?: string
  saveConfig: boolean
  constants: NetlifyPluginConstants
  quiet?: boolean
  debug?: boolean
  logs?: BufferedLogs
  systemLog?: (message: unknown) => void
  edgeFunctionsBootstrapURL?: string
  // systemLog(...args: any[]): void
  featureFlags?: Record<string, any>

  netlifyConfig: NetlifyConfig
  explicitSecretKeys: $TSFixme

  buildbotServerSocket: $TSFixme
}

export type CoreStepFunction = (args: CoreStepFunctionArgs) => Promise<object>
export type CoreStepCondition = (args: CoreStepFunctionArgs) => Promise<boolean> | boolean

type Event = 'onPreBuild' | 'onBuild' | 'onPostBuild' | 'onPreDev' | 'onDev' | 'onPostDev'

export type CoreStep = {
  event: Event
  coreStep: CoreStepFunction
  coreStepId: string
  coreStepName: string
  coreStepDescription: () => string
  condition: CoreStepCondition
}
