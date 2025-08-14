import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { mergeConfigs } from '@netlify/config'

import type { NetlifyConfig } from '../../index.js'
import { getConfigMutations } from '../../plugins/child/diff.js'
import { DEPLOY_CONFIG_DIST_PATH, FRAMEWORKS_API_SKEW_PROTECTION_ENDPOINT } from '../../utils/frameworks_api.js'
import { CoreStep, CoreStepFunction } from '../types.js'

import { loadSkewProtectionConfig } from './skew_protection.js'
import { filterConfig, loadConfigFile } from './util.js'

// The properties that can be set using this API. Each element represents a
// path using dot-notation — e.g. `["build", "functions"]` represents the
// `build.functions` property.
const ALLOWED_PROPERTIES = [
  ['build', 'functions'],
  ['build', 'publish'],
  ['functions', '*'],
  ['functions', '*', '*'],
  ['headers'],
  ['images', 'remote_images'],
  ['redirects'],
]

// For array properties, any values set in this API will be merged with the
// main configuration file in such a way that user-defined values always take
// precedence. The exception are these properties that let frameworks set
// values that should be evaluated before any user-defined values. They use
// a special notation where `redirects!` represents "forced redirects", etc.
const OVERRIDE_PROPERTIES = new Set(['redirects!'])

// Looks for a skew protection configuration file. If found, the file is loaded
// and validated against the schema, throwing a build error if validation
// fails. If valid, the contents are written to the edge redirects file.
const handleSkewProtection = async (buildDir: string, packagePath?: string) => {
  const inputPath = resolve(buildDir, packagePath ?? '', FRAMEWORKS_API_SKEW_PROTECTION_ENDPOINT)
  const outputPath = resolve(buildDir, packagePath ?? '', DEPLOY_CONFIG_DIST_PATH)

  const skewProtectionConfig = await loadSkewProtectionConfig(inputPath)
  if (!skewProtectionConfig) {
    return
  }

  const edgeRedirects = {
    skew_protection: skewProtectionConfig,
  }

  try {
    await fs.mkdir(dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(edgeRedirects))
  } catch (error) {
    throw new Error('Failed to process skew protection configuration', { cause: error })
  }
}

const coreStep: CoreStepFunction = async function ({
  buildDir,
  netlifyConfig,
  packagePath,
  systemLog = () => {
    // no-op
  },
}) {
  await handleSkewProtection(buildDir, packagePath)
  let config: Partial<NetlifyConfig> | undefined

  try {
    config = await loadConfigFile(buildDir, packagePath)
  } catch (err) {
    systemLog(`Failed to read Frameworks API: ${err.message}`)

    throw new Error('An error occured while processing the platform configurarion defined by your framework')
  }

  if (!config) {
    return {}
  }

  const configOverrides: Partial<NetlifyConfig> = {}

  for (const key in config) {
    // If the key uses the special notation for defining mutations that should
    // take precedence over user-defined properties, extract the canonical
    // property, set it on a different object, and delete it from the main one.
    if (OVERRIDE_PROPERTIES.has(key)) {
      const canonicalKey = key.slice(0, -1)

      configOverrides[canonicalKey] = config[key]

      delete config[key]
    }
  }

  // Filtering out any properties that can't be mutated using this API.
  const filteredConfig = filterConfig(config, [], ALLOWED_PROPERTIES, systemLog)

  // Merging the config extracted from the API with the initial config.
  const newConfig = mergeConfigs([filteredConfig, netlifyConfig, configOverrides], {
    concatenateArrays: true,
  }) as Partial<NetlifyConfig>

  // Diffing the initial and the new configs to compute the mutations (what
  // changed between them).
  const configMutations = getConfigMutations(netlifyConfig, newConfig, applyDeployConfig.event)

  return {
    configMutations,
  }
}

export const applyDeployConfig: CoreStep = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'frameworks_api_config',
  coreStepName: 'Applying configuration from Frameworks API',
  coreStepDescription: () => '',
  quiet: true,
}
