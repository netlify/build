import { logMessage, logSubHeader } from '../logger.js'

export const logEdgeManifest = ({ logs, manifest }) => {
  logSubHeader(logs, 'Edge Functions Manifest')
  logMessage(logs, JSON.stringify(manifest))
  logMessage(logs, '')
}
