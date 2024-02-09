import { promises as fs } from 'fs'
import { resolve } from 'path'

import merge from 'deepmerge'

import type { NetlifyConfig } from '../../index.js'
import { CoreStep, CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async function ({ buildDir, netlifyConfig }) {
  const configPath = resolve(buildDir, '.netlify', 'deploy', 'v1', 'config.json')

  let config: Partial<NetlifyConfig> = {}

  try {
    const data = await fs.readFile(configPath, 'utf8')

    config = JSON.parse(data) as Partial<NetlifyConfig>
  } catch {
    return {}
  }

  const newConfig = merge(netlifyConfig, config)

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
  condition: () => true,
  priority: 1,
  quiet: true,
}
