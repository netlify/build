import { logMessage, logArray } from '../logger.js'

export const logEdgeManifest = ({ debug, logs, manifest }) => {
  if (!debug) {
    return
  }

  logMessage(logs, 'Edge Functions Manifest:')
  logArray(logs, manifest)
  logMessage(logs, '')
}
