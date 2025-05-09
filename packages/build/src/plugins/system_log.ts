import type { FeatureFlags } from '../core/feature_flags.js'
import type { SystemLogger } from '../plugins_core/types.js'

import type { ChildProcess } from './spawn.js'

export const captureStandardError = (
  childProcess: ChildProcess,
  systemLog: SystemLogger,
  stdErrMessagePrefix: string,
  featureFlags: FeatureFlags,
) => {
  if (!featureFlags.netlify_build_plugin_system_log) {
    return () => {
      // no-op
    }
  }

  let buffer = ''

  const listener = (chunk: Buffer) => {
    buffer += chunk.toString()
  }

  childProcess.stderr?.on('data', listener)

  const cleanup = () => {
    childProcess.stderr?.removeListener('data', listener)

    if (buffer.length !== 0) {
      systemLog(`${stdErrMessagePrefix}: ${buffer.trim()}`)
    }
  }

  return cleanup
}
