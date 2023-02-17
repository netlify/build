import { gte } from 'semver'

import { Project } from '../project.js'

import { BaseFramework, Category, Framework } from './framework.js'

export class Next extends BaseFramework implements Framework {
  id = 'next'
  name = 'Next.js'
  category = Category.FrontendFramework
  npmDependencies = ['next']

  dev = {
    command: 'next',
    port: 3000,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'next build',
    directory: '.next',
  }

  async detect(project: Project)
  async detect(project: Project): Promise<this | undefined> {
    const detected = await super.detect(project)

    if (detected) {
      const nodeVersion = await project.getCurrentNodeVersion()
      if (nodeVersion && gte(nodeVersion, '10.13.0')) {
        this.plugins.push('@netlify/plugin-nextjs')
      }
    }
    return detected
  }
}
