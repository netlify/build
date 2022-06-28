import { logMessage, logArray } from '../logger.js'

export const logEdgeManifest = ({ logs, manifest }) => {
  logMessage(logs, 'Edge Functions Manifest:')
  logArray(logs, manifest)
  logMessage(logs, '')
}
