import { addErrorInfo } from '../../error/info.js'
import {
  logSecretsScanFailBuildMessage,
  logSecretsScanSkipMessage,
  logSecretsScanSuccessMessage,
} from '../../log/messages/core_steps.js'

import {
  getFilePathsToScan,
  getSecretKeysToScanFor,
  groupScanResultsByKey,
  isSecretsScanningEnabled,
  scanFilesForKeyValues,
} from './utils.js'

const coreStep = async function ({ buildDir, logs, netlifyConfig, explicitSecretKeys, systemLog }) {
  const stepResults = {}

  const passedSecretKeys = (explicitSecretKeys || '').split(',')
  const envVars = netlifyConfig.build.environment as Record<string, unknown>

  systemLog({ envVars, passedSecretKeys })

  if (!isSecretsScanningEnabled(envVars)) {
    logSecretsScanSkipMessage(logs, 'Secrets scanning disabled via SECRETS_SCAN_ENABLED flag set to false.')
    return stepResults
  }

  const keysToSearchFor = getSecretKeysToScanFor(envVars, passedSecretKeys)

  systemLog({ keysToSearchFor })

  if (keysToSearchFor.length === 0) {
    logSecretsScanSkipMessage(
      logs,
      'Secrets scanning skipped because no env vars marked as secret are set to non-empty/non-trivial values or they are all omitted with SECRETS_SCAN_OMIT_KEYS env var setting.',
    )
    return stepResults
  }

  // buildDir is the repository root or the base folder
  // The scanning will look at builddir so that it can review both repo pulled files
  // and post build files
  const filePaths = await getFilePathsToScan({ env: envVars, base: buildDir })

  systemLog({ buildDir, filePaths })

  if (filePaths.length === 0) {
    logSecretsScanSkipMessage(
      logs,
      'Secrets scanning skipped because there are no files or all files were omitted with SECRETS_SCAN_OMIT_PATHS env var setting.',
    )
    return stepResults
  }

  const scanResults = await scanFilesForKeyValues({
    env: envVars,
    keys: keysToSearchFor,
    base: buildDir as string,
    filePaths,
  })

  if (scanResults.matches.length === 0) {
    logSecretsScanSuccessMessage(logs, 'Secrets scanning complete. No secrets detected in build output or repo code.')
    return stepResults
  }

  // at this point we have found matching secrets
  // Output the results and fail the build

  logSecretsScanFailBuildMessage({ logs, scanResults, groupedResults: groupScanResultsByKey(scanResults) })

  const error = new Error(`Secrets scanning found secrets in build.`)
  addErrorInfo(error, { type: 'secretScanningFoundSecrets' })
  throw error
}

// We run this core step if the build was run with explicit secret keys. This
// is passed from BB to build so only accounts that are allowed to have explicit
// secrets and actually have them will have them.
const hasExplicitSecretsKeys = function ({ explicitSecretKeys }): boolean {
  if (typeof explicitSecretKeys !== 'string') {
    return false
  }

  return explicitSecretKeys.length > 0
}

export const scanForSecrets = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'secrets_scanning',
  coreStepName: 'Secrets scanning',
  coreStepDescription: () => 'Scanning for secrets in code and build output.',
  condition: hasExplicitSecretsKeys,
}
