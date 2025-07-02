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
  getOmitValuesFromEnhancedScanForEnhancedScanFromEnv,
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
  featureFlags,
  systemLog,
  deployId,
  api,
}) {
  const stepResults = {}

  const passedSecretKeys = (explicitSecretKeys || '').split(',')
  const envVars = netlifyConfig.build.environment as Record<string, unknown>
  // When the flag is disabled, we may still run the scan if a secrets scan would otherwise take place anyway
  // In this case, we hide any output to the user and simply gather the information in our logs
  const enhancedScanShouldRunInActiveMode = featureFlags?.enhanced_secret_scan_impacts_builds ?? false

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
  const enhancedScanConfigured = enhancedSecretScan && enhancedScanningEnabledInEnv
  if (enhancedSecretScan && enhancedScanShouldRunInActiveMode && !enhancedScanningEnabledInEnv) {
    logSecretsScanSkipMessage(
      logs,
      'Enhanced secrets detection disabled via SECRETS_SCAN_SMART_DETECTION_ENABLED flag set to false.',
    )
  }

  if (
    enhancedScanShouldRunInActiveMode &&
    enhancedScanConfigured &&
    envVars['SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES'] !== undefined
  ) {
    log(
      logs,
      `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES override option set to: ${envVars['SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES']}\n`,
    )
  }

  const keysToSearchFor = getSecretKeysToScanFor(envVars, passedSecretKeys)

  // In passive mode, only run the enhanced scan if we have explicit secret keys
  const enhancedScanShouldRun = enhancedScanShouldRunInActiveMode
    ? enhancedScanConfigured
    : enhancedScanConfigured && keysToSearchFor.length > 0
  if (keysToSearchFor.length === 0 && !enhancedScanShouldRun) {
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
        enhancedScanning: enhancedScanShouldRun,
        omitValuesFromEnhancedScan: getOmitValuesFromEnhancedScanForEnhancedScanFromEnv(envVars),
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
        enhancedScanning: enhancedScanShouldRun,
        enhancedScanActiveMode: enhancedScanShouldRunInActiveMode,
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
      enhancedSecretsScanMatches:
        enhancedScanShouldRunInActiveMode && enhancedSecretMatches ? enhancedSecretMatches : [],
    }
    reportValidations({ api, secretScanResult, deployId, systemLog })
  }

  if (
    !scanResults ||
    scanResults.matches.length === 0 ||
    (!enhancedScanShouldRunInActiveMode && !secretMatches?.length)
  ) {
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
    enhancedScanShouldRunInActiveMode,
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
