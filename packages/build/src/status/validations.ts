import { SecretScanResult } from '../plugins_core/secrets_scanning/utils.js'

// Reports any validations completed on the deploy to the API
export const reportValidations = async function ({
  api,
  secretScanResult,
  deployId,
}: {
  api: unknown
  secretScanResult: SecretScanResult
  deployId: string
}) {
  try {
    // @ts-expect-error API type is not defined
    api.updateDeployValidations({ deploy_id: deployId, body: { secrets_scan: secretScanResult } })
  } catch {
    // Noop
  }
}
