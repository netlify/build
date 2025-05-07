import { DynamicMethods } from 'packages/js-client/lib/types.js'

import { SecretScanResult } from '../plugins_core/secrets_scanning/utils.js'
import { SystemLogger } from '../plugins_core/types.js'

// Reports any validations completed on the deploy to the API
export const reportValidations = async function ({
  api,
  secretScanResult,
  deployId,
  systemLog,
}: {
  api: DynamicMethods
  secretScanResult: SecretScanResult
  deployId: string
  systemLog: SystemLogger
}) {
  try {
    // @ts-expect-error Property 'updateDeployValidations' does not exist on type 'DynamicMethods'. This is a private/internal-only method and isn't generated in the type definitions.
    await api.updateDeployValidations({ deploy_id: deployId, body: { secrets_scan: secretScanResult } })
  } catch (e) {
    systemLog(`Unable to report secrets scanning results to API. Deploy id: ${deployId}`, e)
  }
}
