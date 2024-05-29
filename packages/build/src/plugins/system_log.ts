import type { FeatureFlags } from '../core/feature_flags.js'
import type { SystemLogger } from '../plugins_core/types.js'

import type { ChildProcess } from './spawn.js'

export const captureStandardError = (
  childProcess: ChildProcess,
  systemLog: SystemLogger,
  eventName: string,
  featureFlags: FeatureFlags,
) => {
  if (!featureFlags.netlify_build_plugin_system_log) {
    return () => {
      // no-op
    }
  }

  let receivedChunks = false

  const listener = (chunk: Buffer) => {
    if (!receivedChunks) {
      receivedChunks = true

      systemLog(`Plugin failed to initialize during the "${eventName}" phase`)
    }

    systemLog(chunk.toString().trimEnd())
  }

  childProcess.stderr?.on('data', listener)

  const cleanup = () => {
    childProcess.stderr?.removeListener('data', listener)
  }

  return cleanup
}
