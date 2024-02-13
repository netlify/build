import { promises as fs } from 'fs'
import { resolve } from 'path'

import { mergeConfigs } from '@netlify/config'

import type { NetlifyConfig } from '../../index.js'
import { CoreStep, CoreStepFunction } from '../types.js'

import { filterConfig } from './util.js'

// The properties that can be set using this API. Each element represents a
// path using dot-notation — e.g. `["build", "functions"]` represents the
// `build.functions` property.
const ALLOWED_PROPERTIES = [
  ['build', 'edge_functions'],
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
// a special notation where `headers!` represents "forced headers", etc.
const OVERRIDE_PROPERTIES = new Set(['headers!', 'redirects!'])

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
  config = filterConfig(config, [], ALLOWED_PROPERTIES, systemLog)

  // Merging the different configuration sources. The order here is important.
  // Leftmost elements of the array take precedence.
  const newConfig = mergeConfigs([config, netlifyConfig, configOverrides], { concatenateArrays: true })

  for (const key in newConfig) {
    netlifyConfig[key] = newConfig[key]
  }

  return {}
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
