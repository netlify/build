import { logMessage, logSubHeader } from '../logger.js'

export const logEdgeManifest = ({ logs, manifest }) => {
  logSubHeader(logs, 'Edge Functions Manifest')
  logMessage(logs, JSON.stringify(manifest, null, 2))
  logMessage(logs, '')
}
