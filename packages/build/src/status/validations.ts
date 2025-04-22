import { NetlifyAPI } from 'packages/js-client/lib/index.js'

import { SecretScanResult } from '../plugins_core/secrets_scanning/utils.js'
import { SystemLogger } from '../plugins_core/types.js'

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
    // @ts-expect-error Property 'updateDeployValidations' does not exist on type 'NetlifyAPI'
    await api.updateDeployValidations({ deploy_id: deployId, body: { secrets_scan: secretScanResult } })
  } catch {
    systemLog('Unable to report secrets scanning results to API')
  }
}
