import { promises as fs } from 'fs'
import { resolve } from 'path'

import { mergeConfigs } from '@netlify/config'

import type { NetlifyConfig } from '../../index.js'
import { getConfigMutations } from '../../plugins/child/diff.js'
import { CoreStep, CoreStepFunction } from '../types.js'

import { filterConfig } from './util.js'

// The properties that can be set using this API. Each element represents a
// path using dot-notation — e.g. `["build", "functions"]` represents the
// `build.functions` property.
const ALLOWED_PROPERTIES = [['images', 'remote_images']]

const coreStep: CoreStepFunction = async function ({
  buildDir,
  netlifyConfig,
  systemLog = () => {
    // no-op
  },
}) {
  const configPath = resolve(buildDir, '.netlify/deploy/v1/config.json')

  let config: Partial<NetlifyConfig> = {}

  try {
    const data = await fs.readFile(configPath, 'utf8')

    config = JSON.parse(data) as Partial<NetlifyConfig>
  } catch (err) {
    // If the file doesn't exist, this is a non-error.
    if (err.code === 'ENOENT') {
      return {}
    }

    systemLog(`Failed to read Deploy Configuration API: ${err.message}`)

    throw new Error('An error occured while processing the platform configurarion defined by your framework')
  }

  // Filtering out any properties that can't be mutated using this API.
  const filteredConfig = filterConfig(config, [], ALLOWED_PROPERTIES, systemLog)

  // Merging the config extracted from the API with the initial config.
  const newConfig = mergeConfigs([filteredConfig, netlifyConfig], { concatenateArrays: true }) as Partial<NetlifyConfig>

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
  coreStepId: 'deploy_config',
  coreStepName: 'Applying Deploy Configuration',
  coreStepDescription: () => '',
  condition: ({ featureFlags }) => featureFlags?.netlify_build_deploy_configuration_api,
  quiet: true,
}
