import type { NetlifyAPI } from '@netlify/api'

import { SecretScanResult } from '../plugins_core/secrets_scanning/utils.js'
import { SystemLogger } from '../plugins_core/types.js'

declare module '@netlify/api' {
  interface NetlifyAPI {
    // Generated at runtime from the OpenAPI spec, but left out of its types since it is internal-only
    updateDeployValidations: (params: {
      deploy_id: string
      body: { secrets_scan: SecretScanResult }
    }) => Promise<unknown>
  }
}

// Reports any validations completed on the deploy to the API
export const reportValidations = async function ({
  api,
  secretScanResult,
  deployId,
  systemLog,
}: {
  api: NetlifyAPI
  secretScanResult: SecretScanResult
  deployId: string
  systemLog: SystemLogger
}) {
  try {
    await api.updateDeployValidations({ deploy_id: deployId, body: { secrets_scan: secretScanResult } })
  } catch (e) {
    systemLog(`Unable to report secrets scanning results to API. Deploy id: ${deployId}`, e)
  }
}
