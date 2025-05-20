import { trace } from '@opentelemetry/api'

import { addErrorInfo } from '../../error/info.js'
import { log } from '../../log/logger.js'
import {
  logSecretsScanFailBuildMessage,
  logSecretsScanSkipMessage,
  logSecretsScanSuccessMessage,
} from '../../log/messages/core_steps.js'
import { reportValidations } from '../../status/validations.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

import {
  ScanResults,
  SecretScanResult,
  getFilePathsToScan,
  getOmitValuesFromEnv,
  getSecretKeysToScanFor,
  groupScanResultsByKeyAndScanType,
  isEnhancedSecretsScanningEnabled,
  isSecretsScanningEnabled,
  scanFilesForKeyValues,
} from './utils.js'

const tracer = trace.getTracer('secrets-scanning')

const coreStep: CoreStepFunction = async function ({
  buildDir,
  logs,
  netlifyConfig,
  explicitSecretKeys,
  enhancedSecretScan,
  systemLog,
  deployId,
  api,
}) {
  const stepResults = {}

  const passedSecretKeys = (explicitSecretKeys || '').split(',')
  const envVars = netlifyConfig.build.environment as Record<string, unknown>

  systemLog?.({ passedSecretKeys, buildDir })

  if (!isSecretsScanningEnabled(envVars)) {
    logSecretsScanSkipMessage(logs, 'Secrets scanning disabled via SECRETS_SCAN_ENABLED flag set to false.')
    return stepResults
  }

  // transparently log if there are scanning values being omitted
  if (envVars['SECRETS_SCAN_OMIT_KEYS'] !== undefined) {
    log(logs, `SECRETS_SCAN_OMIT_KEYS override option set to: ${envVars['SECRETS_SCAN_OMIT_KEYS']}\n`)
  }
  if (envVars['SECRETS_SCAN_OMIT_PATHS'] !== undefined) {
    log(logs, `SECRETS_SCAN_OMIT_PATHS override option set to: ${envVars['SECRETS_SCAN_OMIT_PATHS']}\n`)
  }
  const enhancedScanningEnabledInEnv = isEnhancedSecretsScanningEnabled(envVars)
  if (enhancedSecretScan && !enhancedScanningEnabledInEnv) {
    logSecretsScanSkipMessage(
      logs,
      'Automatic secrets detection disabled via ENHANCED_SECRETS_SCAN_ENABLED flag set to false.',
    )
  }

  const keysToSearchFor = getSecretKeysToScanFor(envVars, passedSecretKeys)

  if (keysToSearchFor.length === 0 && !enhancedSecretScan) {
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

  if (filePaths.length === 0) {
    logSecretsScanSkipMessage(
      logs,
      'Secrets scanning skipped because there are no files or all files were omitted with SECRETS_SCAN_OMIT_PATHS env var setting.',
    )
    return stepResults
  }

  let scanResults: ScanResults | undefined
  let secretMatches: SecretScanResult['secretsScanMatches'] | undefined
  let enhancedSecretMatches: SecretScanResult['enhancedSecretsScanMatches'] | undefined

  await tracer.startActiveSpan(
    'scanning-files',
    { attributes: { keysToSearchFor, totalFiles: filePaths.length } },
    async (span) => {
      scanResults = await scanFilesForKeyValues({
        env: envVars,
        keys: keysToSearchFor,
        base: buildDir as string,
        filePaths,
        enhancedScanning: enhancedSecretScan && enhancedScanningEnabledInEnv,
        omitValues: getOmitValuesFromEnv(envVars),
      })

      secretMatches = scanResults.matches.filter((match) => !match.enhancedMatch)
      enhancedSecretMatches = scanResults.matches.filter((match) => match.enhancedMatch)

      const attributesForLogsAndSpan = {
        secretsScanFoundSecrets: secretMatches.length > 0,
        enhancedSecretsScanFoundSecrets: enhancedSecretMatches.length > 0,
        secretsScanMatchesCount: secretMatches.length,
        enhancedSecretsScanMatchesCount: enhancedSecretMatches.length,
        secretsFilesCount: scanResults.scannedFilesCount,
        keysToSearchFor,
        enhancedPrefixMatches: enhancedSecretMatches.length ? enhancedSecretMatches.map((match) => match.key) : [],
      }

      systemLog?.(attributesForLogsAndSpan)
      span.setAttributes(attributesForLogsAndSpan)
      span.end()
    },
  )

  if (deployId !== '0') {
    const secretScanResult: SecretScanResult = {
      scannedFilesCount: scanResults?.scannedFilesCount ?? 0,
      secretsScanMatches: secretMatches ?? [],
      enhancedSecretsScanMatches: enhancedSecretMatches ?? [],
    }
    reportValidations({ api, secretScanResult, deployId, systemLog })
  }

  if (!scanResults || scanResults.matches.length === 0) {
    logSecretsScanSuccessMessage(
      logs,
      `Secrets scanning complete. ${scanResults?.scannedFilesCount} file(s) scanned. No secrets detected in build output or repo code!`,
    )
    return stepResults
  }

  // at this point we have found matching secrets
  // Output the results and fail the build
  logSecretsScanFailBuildMessage({
    logs,
    scanResults,
    groupedResults: groupScanResultsByKeyAndScanType(scanResults),
  })

  const error = new Error(`Secrets scanning found secrets in build.`)
  addErrorInfo(error, { type: 'secretScanningFoundSecrets' })
  throw error
}

// We run this core step if the build was run with explicit secret keys or if enhanced secret scanning is enabled.
// This is passed from BB to build so only accounts that are allowed to have explicit
// secrets and actually have them / have enhanced secret scanning enabled will have them.
const hasExplicitSecretsKeysOrEnhancedScanningEnabled: CoreStepCondition = function ({
  explicitSecretKeys,
  enhancedSecretScan,
}): boolean {
  if (enhancedSecretScan) {
    return true
  }
  if (typeof explicitSecretKeys !== 'string') {
    return false
  }

  return explicitSecretKeys.length > 0
}

export const scanForSecrets: CoreStep = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'secrets_scanning',
  coreStepName: 'Secrets scanning',
  coreStepDescription: () => 'Scanning for secrets in code and build output.',
  condition: hasExplicitSecretsKeysOrEnhancedScanningEnabled,
}
